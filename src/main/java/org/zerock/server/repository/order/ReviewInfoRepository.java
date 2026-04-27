package org.zerock.server.repository.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.server.domain.order.ReviewInfo;

import java.util.List;
import java.util.Optional;

public interface ReviewInfoRepository extends JpaRepository<ReviewInfo, Long> {
    // 거래당 리뷰 1개 (중복방지)
    Optional<ReviewInfo> findByTransaction_TransactionId(Long transactionId);

    // 내가 작성한 리뷰 목록 (페이징)
    Page<ReviewInfo> findAllByReviewer_UserId(Long userId, Pageable pageable);

    // 피평가자 기준 리뷰 목록 (페이징, 필요시)
    Page<ReviewInfo> findAllByReviewee_UserId(Long userId, Pageable pageable);

    // (참고) 전체(페이징X)
    List<ReviewInfo> findAllByReviewer_UserId(Long userId);
    List<ReviewInfo> findAllByReviewee_UserId(Long userId);
}
