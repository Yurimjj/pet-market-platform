package org.zerock.server.service.board;

import org.zerock.server.dto.board.BoardCommentDTO;
import org.zerock.server.dto.board.CommentPageDTO;
import org.zerock.server.dto.board.PageRequestDTO;
import org.zerock.server.dto.board.PageResponseDTO;

import java.util.List;

public interface BoardCommentService {

    // 댓글 등록 (최상위 댓글 / 대댓글)
    Long register(BoardCommentDTO boardCommentDTO, Long userId);

    // 댓글 수정
    void updateComment(Long commentId, Long userId, String content); // 반환 타입 void로 변경

    // 댓글 삭제 (물리적 삭제 X, isDeleted true)
    void removeComment(Long commentId, Long userId);

    // 부모 댓글 + 대댓글 조회 (페이징 포함)
    CommentPageDTO getParentCommentsWithPaging(Long postId, int page, int size);

    // 게시글에 달린 총 댓글 개수
    Long getTotalCommentCount(Long postId);
}