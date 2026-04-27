package org.zerock.server.repository.board;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.zerock.server.domain.board.BoardComment;

import java.util.List;

public interface BoardCommentRepository extends JpaRepository<BoardComment, Long> {

    // 특정 게시글의 최상위 댓글 조회 (depth=0, 삭제되지 않은)
    Page<BoardComment> findByPost_PostIdAndDepthAndIsDeletedFalse(Long postId, int depth, Pageable pageable);

    // 특정 댓글의 자식 댓글 조회 (삭제되지 않은)
    List<BoardComment> findByParentCommentAndIsDeletedFalse(BoardComment parentComment);

    // 특정 댓글의 자식 댓글 조회 (정렬 포함)
    List<BoardComment> findByParentCommentAndIsDeletedFalseOrderByCreatedAtAsc(BoardComment parentComment);

    // 총 댓글 수 (부모 + 대댓글)
    long countByPost_PostIdAndIsDeletedFalse(Long postId);

}
