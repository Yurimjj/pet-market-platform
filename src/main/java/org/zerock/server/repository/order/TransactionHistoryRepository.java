package org.zerock.server.repository.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.server.domain.order.TransactionHistory;

import java.util.List;
import java.util.Optional;

public interface TransactionHistoryRepository extends JpaRepository<TransactionHistory, Long> {
    // 거래 상세 (상품ID로 단건)
    Optional<TransactionHistory> findByProduct_ProductId(Long productId);

    // 구매자 기준 거래 내역 (페이징)
    Page<TransactionHistory> findAllByBuyer_UserId(Long userId, Pageable pageable);

    // 판매자 기준 거래 내역 (페이징)
    Page<TransactionHistory> findAllBySeller_UserId(Long userId, Pageable pageable);

    // (구매+판매자 모두 참여한 거래 내역 - 페이징)
    Page<TransactionHistory> findAllByBuyer_UserIdOrSeller_UserId(Long buyerId, Long sellerId, Pageable pageable);

    // (참고) 페이징 없이 전체 목록 (기존 방식)
    List<TransactionHistory> findAllBySeller_UserId(Long userId);
    List<TransactionHistory> findAllByBuyer_UserId(Long userId);

    // 같은 구매자·같은 상품의 최근 거래(열려있는지 여부 판단 전용, 우선 최근 1건)
    Optional<TransactionHistory>
    findTopByProduct_ProductIdAndBuyer_UserIdOrderByTransactionIdDesc(Long productId, Long buyerId);

    // [ADD] 내(구매자)가 해당 상품에 대해 만든 "활성" 거래가 있는지 확인
    //  - 여기서는 "판매완료"가 아닌 상태를 활성으로 간주합니다.
    //  - 프로젝트에서 다른 종료 상태가 있다면 필요 시 IN/NOT IN 으로 확장.
    boolean existsByProduct_ProductIdAndBuyer_UserIdAndTransactionStatusNot(
            Long productId, Long buyerId, String transactionStatus);

    // 구매자 기준 + 상태 필터(예약중)
    Page<TransactionHistory> findAllByBuyer_UserIdAndTransactionStatus(
            Long userId, String transactionStatus, Pageable pageable);

    // 판매자 기준 + 상태 필터(예약중)
    Page<TransactionHistory> findAllBySeller_UserIdAndTransactionStatus(
            Long userId, String transactionStatus, Pageable pageable);

}
