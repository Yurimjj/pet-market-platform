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
import org.zerock.server.domain.board.BoardAttachment;
import org.zerock.server.domain.board.BoardCategory;
import org.zerock.server.domain.board.BoardPost;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.dto.board.BoardAttachmentDTO;
import org.zerock.server.dto.board.BoardPostDTO;
import org.zerock.server.dto.board.PageRequestDTO;
import org.zerock.server.dto.board.PageResponseDTO;
import org.zerock.server.repository.user.UserInfoRepository;
import org.zerock.server.repository.board.BoardAttachmentRepository;
import org.zerock.server.repository.board.BoardCategoryRepository;
import org.zerock.server.repository.board.BoardCommentRepository;
import org.zerock.server.repository.board.BoardPostRepository;
import org.zerock.server.util.CustomFileUtil;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
@Log4j2
@RequiredArgsConstructor
public class BoardPostServiceImpl implements BoardPostService {

    private final ModelMapper modelMapper;
    private final BoardPostRepository boardPostRepository;
    private final BoardCategoryRepository boardCategoryRepository;
    private final UserInfoRepository userInfoRepository;
    private final CustomFileUtil customFileUtil;
    private final BoardAttachmentRepository boardAttachmentRepository;
    private final BoardCommentRepository boardCommentRepository;

    @Override
    public Long register(BoardPostDTO boardPostDTO, Long userId) {
        log.info("=======================POST REGISTER=======================");

        UserInfo userInfo = userInfoRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. User ID: " + userId));

        BoardCategory category = boardCategoryRepository.findByCategoryName(boardPostDTO.getCategoryName())
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));

        BoardPost boardPost = modelMapper.map(boardPostDTO, BoardPost.class);

        boardPost.setUserInfo(userInfo);
        boardPost.changeCategory(category);

        BoardPost savedPost = boardPostRepository.save(boardPost);

        List<String> fileNames = boardPostDTO.getUploadFileNames();
        if (fileNames != null && !fileNames.isEmpty()) {
            for (String fileName : fileNames) {
                BoardAttachment attachment = BoardAttachment.builder()
                        .boardPost(savedPost)
                        .fileUrl(fileName)
                        .fileType(customFileUtil.getFileType(fileName))
                        .build();

                boardAttachmentRepository.save(attachment);
            }
        }
        return savedPost.getPostId();
    }


    @Override
    public BoardPostDTO get(Long postId) {

        Optional<BoardPost> result = boardPostRepository.findByPostIdAndIsDeletedFalse(postId);
        BoardPost boardPost = result.orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없거나 삭제되었습니다."));

        boardPostRepository.incrementViewCount(postId);

        BoardPostDTO boardPostDTO = modelMapper.map(boardPost, BoardPostDTO.class);

        if (boardPost.getCategory() != null) {
            boardPostDTO.setCategoryName(boardPost.getCategory().getCategoryName());
        }
        if (boardPost.getUserInfo() != null) {
            boardPostDTO.setNickname(boardPost.getUserInfo().getNickname());
            boardPostDTO.setUserInfo(boardPost.getUserInfo().getUserId());
        }

        List<BoardAttachment> attachments = boardAttachmentRepository.findByBoardPost(boardPost);

        boardPostDTO.setUploadFileNames(
                attachments.stream()
                        .map(BoardAttachment::getFileUrl)
                        .collect(Collectors.toList())
        );

        boardPostDTO.setAttachmentList(
                attachments.stream()
                        .map(a -> BoardAttachmentDTO.builder()
                                .attachmentId(a.getAttachmentId())
                                .fileName(a.getFileUrl())
                                .build())
                        .collect(Collectors.toList())
        );

        return boardPostDTO;
    }

    @Override
    public void remove(Long postId, Long userId) {

        BoardPost boardPost = boardPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다"));

        if (!boardPost.getUserInfo().getUserId().equals(userId)) {
            throw new IllegalArgumentException("삭제 권한이 없습니다. (게시글 작성자 불일치)");
        }

        List<BoardAttachment> attachments = boardAttachmentRepository.findByBoardPost(boardPost);

        List<String> fileNamesToDelete = attachments.stream()
                .map(BoardAttachment::getFileUrl)
                .collect(Collectors.toList());

        if (!fileNamesToDelete.isEmpty()) {
            customFileUtil.deleteFiles(fileNamesToDelete);
            log.info("파일 삭제 완료: {} ", fileNamesToDelete);
        } else {
            log.info("삭제할 업로드 파일 없음.");
        }

        // 5. DB에서 첨부파일 레코드 삭제 (게시글 - 소프트 삭제, 첨부파일은 물리적 삭제 >> DB에서도 삭제.)
        boardAttachmentRepository.deleteAll(attachments);
        boardPostRepository.updateIsDeletedStatus(postId, true);
    }

    @Override
    public void removeAttachment(Long postId, Long attachmentId, Long userId) {
        log.info("게시글 ID: " + postId + "의 첨부파일 ID: " + attachmentId + " 삭제 요청");

        BoardAttachment attachment = boardAttachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new IllegalArgumentException("첨부파일을 찾을 수 없습니다."));

        if (!attachment.getBoardPost().getUserInfo().getUserId().equals(userId)) {
            throw new IllegalArgumentException("삭제권한이 없습니다. (게시글 작성자 불일치)");
        }

        customFileUtil.deleteFiles(List.of(attachment.getFileUrl()));
        log.info("시스템에서 파일 삭제 완료: " + attachment.getFileUrl());

        boardAttachmentRepository.delete(attachment);
        log.info("DB에서 첨부파일 레코드 삭제 완료: " + attachment);

        log.info("첨부파일 ID: " + attachment + " >>> 삭제 완료 !");
    }

    @Override
    public void modify(Long postId, BoardPostDTO boardPostDTO, Long userId) {

        Optional<BoardPost> result = boardPostRepository.findById(postId);
        BoardPost boardPost = result.orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        if (!boardPost.getUserInfo().getUserId().equals(userId)) {
            throw new IllegalArgumentException("수정 권한이 없습니다. (게시글 작성자 불일치)");
        }

        BoardCategory category = boardCategoryRepository.findByCategoryName(boardPostDTO.getCategoryName())
                .orElseThrow(() -> new IllegalArgumentException("카테고리 없음"));

        boardPost.changeCategory(category);
        boardPost.changeTitle(boardPostDTO.getTitle());
        boardPost.changeContent(boardPostDTO.getContent());

        List<BoardAttachment> currentAttachments = boardAttachmentRepository.findByBoardPost(boardPost);
        // 비교 효율성 위해 현재파일들의 이름만 Set으로 변환하여 저장
        Set<String> currentFileUrls = currentAttachments.stream()
                .map(BoardAttachment::getFileUrl)
                .collect(Collectors.toSet());

        List<String> newFileUrls = boardPostDTO.getUploadFileNames();

        Set<String> newFileUrlsSet = (newFileUrls != null) ? new HashSet<>(newFileUrls) : new HashSet<>();

        List<BoardAttachment> attachmentsToDelete = currentAttachments.stream()
                .filter(attachment -> !newFileUrlsSet.contains(attachment.getFileUrl()))
                .collect(Collectors.toList());

        if (!attachmentsToDelete.isEmpty()) {
            boardAttachmentRepository.deleteAll(attachmentsToDelete);
            log.info("DB에서 삭제된 첨부 파일 레코드: " + attachmentsToDelete.size() + "개");
        }

        List<String> filesToAddToDb = newFileUrlsSet.stream()
                .filter(fileUrl -> !currentFileUrls.contains(fileUrl))
                .collect(Collectors.toList());

        if (!filesToAddToDb.isEmpty()) {
            for (String fileUrl : filesToAddToDb) {
                BoardAttachment attachment = BoardAttachment.builder()
                        .boardPost(boardPost)
                        .fileUrl(fileUrl)
                        .fileType(customFileUtil.getFileType(fileUrl))
                        .build();

                boardAttachmentRepository.save(attachment);
            }
            log.info("DB에 추가된 첨부 파일 레코드: " + filesToAddToDb.size() + "개");
        }

        boardPostRepository.save(boardPost);
    }

    @Override
    public PageResponseDTO<BoardPostDTO> list(PageRequestDTO pageRequestDTO) {
        log.info("BoardPostService list called with: " + pageRequestDTO);

        // 페이지 요청 객체 생성 (페이지 번호는 0부터 시작하므로 page - 1)
        Pageable pageable = PageRequest.of(
                pageRequestDTO.getPage() - 1, // 페이지 번호 (0부터 시작)
                pageRequestDTO.getSize(),     // 페이지 크기
                Sort.by("postId").descending() // 기본 정렬 (최신 게시물부터)
        );

        Page<BoardPost> result;

        if (pageRequestDTO.getType() != null && !pageRequestDTO.getType().isEmpty() &&
                pageRequestDTO.getKeyword() != null && !pageRequestDTO.getKeyword().isEmpty()) {

            if ("c".equals(pageRequestDTO.getType())) {
                // 카테고리 이름으로 게시글을 조회하는 새로운 쿼리 메서드가 필요
                result = boardPostRepository.findByCategory_CategoryNameAndIsDeletedFalse(pageRequestDTO.getKeyword(), pageable);
            }
            else if ("t".equals(pageRequestDTO.getType())) {
                result = boardPostRepository.findByTitleContainingAndIsDeletedFalse(pageRequestDTO.getKeyword(), pageable);
            }
            else if ("u".equals(pageRequestDTO.getType())) {
                try {
                    Long uid = Long.parseLong(pageRequestDTO.getKeyword());
                    result = boardPostRepository.findByUserInfo_UserIdAndIsDeletedFalse(uid, pageable);
                } catch (NumberFormatException e) {
                    log.warn("[list] type=u 이지만 keyword가 숫자가 아님: {}", pageRequestDTO.getKeyword());
                    // 잘못된 userId가 넘어오면 안전하게 기본 목록으로 fallback
                    result = boardPostRepository.findAllByIsDeletedFalse(pageable);
                }
            }

            else {
                // 정의되지 않은 type이 넘어온 경우 기본 목록 조회
                result = boardPostRepository.findAllByIsDeletedFalse(pageable);
            }
        } else {
            // 검색 조건이 없는 경우 (기존처럼 모든 게시글 조회)
            result = boardPostRepository.findAllByIsDeletedFalse(pageable);
        }

        List<BoardPostDTO> dtoList = result.getContent().stream()
                .map(boardPost -> {
                    BoardPostDTO boardPostDTO = modelMapper.map(boardPost, BoardPostDTO.class);

                    if (boardPost.getCategory() != null) {
                        boardPostDTO.setCategoryName(boardPost.getCategory().getCategoryName());
                    }

                    if (boardPost.getUserInfo() != null) {
                        boardPostDTO.setNickname(boardPost.getUserInfo().getNickname());
                        boardPostDTO.setUserInfo(boardPost.getUserInfo().getUserId()); // userId도 필요하다면 설정
                    }
                    return boardPostDTO;
                })
                .collect(Collectors.toList());

        long totalCount = result.getTotalElements();

        PageResponseDTO<BoardPostDTO> responseDTO = PageResponseDTO.<BoardPostDTO>withAll()
                .dtoList(dtoList)
                .pageRequestDTO(pageRequestDTO)
                .totalCount(totalCount)
                .build();

        return responseDTO;
    }
}
