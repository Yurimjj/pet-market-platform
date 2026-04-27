package org.zerock.server.service.board;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.server.domain.board.BoardComment;
import org.zerock.server.domain.board.BoardPost;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.dto.board.*;
import org.zerock.server.repository.user.UserInfoRepository;
import org.zerock.server.repository.board.BoardCommentRepository;
import org.zerock.server.repository.board.BoardPostRepository;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@Transactional
@Log4j2
@RequiredArgsConstructor
public class BoardCommentServiceImpl implements BoardCommentService {

    private final BoardCommentRepository boardCommentRepository;
    private final BoardPostRepository boardPostRepository;
    private final UserInfoRepository userInfoRepository;
    private final ModelMapper modelMapper;

    @Override
    public Long register(BoardCommentDTO boardCommentDTO, Long userId) {
        log.info("=======================COMMENT REGISTER=======================");

        UserInfo user = userInfoRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        BoardPost post = boardPostRepository.findById(boardCommentDTO.getPostId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시글입니다."));

        BoardComment comment = modelMapper.map(boardCommentDTO, BoardComment.class);
        comment.setUser(user);
        comment.setPost(post);

        if (boardCommentDTO.getParentId() != null) {
            BoardComment parentComment = boardCommentRepository.findById(boardCommentDTO.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 부모댓글입니다."));

            if (parentComment.getDepth() != 0) {
                throw new IllegalArgumentException("대댓글은 최상위 댓글에만 달 수 있습니다.");
            }

            comment.setParentComment(parentComment);
        }

        BoardComment savedComment = boardCommentRepository.save(comment);
        return savedComment.getCommentId();
    }

    @Override
    public void removeComment(Long commentId, Long userId) {
        BoardComment comment = boardCommentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 댓글입니다."));

        if (!comment.getUser().getUserId().equals(userId)){
            throw new IllegalArgumentException("삭제 권한이 없습니다.");
        }

        comment.setDeleted(true);
        boardCommentRepository.save(comment);

        if (comment.getDepth() == 0){
            List<BoardComment> childComments = boardCommentRepository
                    .findByParentCommentAndIsDeletedFalseOrderByCreatedAtAsc(comment);

            childComments.forEach(c -> c.setDeleted(true));
            boardCommentRepository.saveAll(childComments);
        }
    }

    @Override
    public void updateComment(Long commentId, Long userId, String content) {
        log.info("=======================댓글 수정 시작=======================");
        log.info("수정 요청 댓글 ID: {}", commentId);
        log.info("요청 사용자 ID: {}", userId);
        log.info("새로운 내용: {}", content);

        BoardComment comment = boardCommentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다. Comment ID: " + commentId));

        // 권한 확인: 댓글 작성자만 수정 가능
        if (!comment.getUser().getUserId().equals(userId)) {
            throw new IllegalArgumentException("댓글 수정 권한이 없습니다.");
        }

        comment.changeContent(content);
        boardCommentRepository.save(comment); // 저장 후 반환값을 받지 않음

        log.info("댓글 ID {} 수정 완료.", commentId);
    }

    @Override
    public CommentPageDTO getParentCommentsWithPaging(Long postId, int page, int size) {
        log.info("게시글 ID {}의 댓글 목록 (페이지: {}, 크기: {}) 조회 시작", postId, page, size);

        boardPostRepository.findById(postId)
                .orElseThrow(() -> new NoSuchElementException("게시글을 찾을 수 없습니다. Post ID: " + postId));

        Pageable pageable = PageRequest.of(page, size, Sort.by("commentId").ascending());

        Page<BoardComment> parentCommentsPage = boardCommentRepository
                .findByPost_PostIdAndDepthAndIsDeletedFalse(postId, 0, pageable);

        List<BoardCommentDTO> parentDTOs = parentCommentsPage.getContent().stream().map(parent -> {
            BoardCommentDTO parentDTO = modelMapper.map(parent, BoardCommentDTO.class);

            if (parent.getUser() != null) {
                parentDTO.setNickname(parent.getUser().getNickname());
            }

            if (parent.isDeleted()) {
                parentDTO.setContent("삭제된 댓글입니다.");
                parentDTO.setNickname("(알 수 없음)");
            }

            // 자식 댓글 조회
            List<BoardComment> childComments = boardCommentRepository.findByParentCommentAndIsDeletedFalse(parent);

            List<BoardCommentDTO> childDTOs = childComments.stream()
                    .map(child -> {
                        BoardCommentDTO childDTO = modelMapper.map(child, BoardCommentDTO.class);

                        if (child.getUser() != null) {
                            childDTO.setNickname(child.getUser().getNickname());
                        }

                        if (child.isDeleted()) {
                            childDTO.setContent("삭제된 댓글입니다.");
                            childDTO.setNickname("(알 수 없음)");
                        }
                        return childDTO;
                    })
                    .toList();

            parentDTO.setChildren(childDTOs);
            return parentDTO;
        }).toList();

        return new CommentPageDTO(
                parentDTOs,
                parentCommentsPage.getNumber(),
                parentCommentsPage.getSize(),
                parentCommentsPage.getTotalElements(),
                parentCommentsPage.getTotalPages()
        );
    }

    @Override
    public Long getTotalCommentCount(Long postId) {
        return boardCommentRepository.countByPost_PostIdAndIsDeletedFalse(postId);
    }
}
