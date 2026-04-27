package org.zerock.server.repository.board;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.server.domain.board.BoardPost;

import java.util.Optional;

public interface BoardPostRepository extends JpaRepository<BoardPost, Long> {

    // 조회수만 증가 (수정 시간 업데이트 되지 않도록)
    @Modifying
    @Query("update BoardPost p set p.viewCount = p.viewCount + 1 where p.postId = :postId")
    void incrementViewCount(@Param("postId") Long postId);

    // 삭제 대신 isDeleted = true 로 변경하는 쿼리
    @Modifying
    @Transactional
    @Query("update BoardPost p set p.isDeleted = :isDeleted where p.postId = :postId")
    void updateIsDeletedStatus(@Param("postId") Long postId, @Param("isDeleted") boolean isDeleted);

    // 게시글 ID와 isDeleted 가 false 인 게시글을 찾아오는 메서드
    Optional<BoardPost> findByPostIdAndIsDeletedFalse(Long postId);

    // 페이징 처리 위해 Pageable 파라미터 Page 반환 타입 사용
    Page<BoardPost> findAllByIsDeletedFalse(Pageable pageable);

    Page<BoardPost> findByCategory_CategoryNameAndIsDeletedFalse(String categoryName, Pageable pageable);

    Page<BoardPost> findByTitleContainingAndIsDeletedFalse(String title, Pageable pageable);

    Page<BoardPost> findByUserInfo_UserIdAndIsDeletedFalse(Long userId, Pageable pageable);


}
