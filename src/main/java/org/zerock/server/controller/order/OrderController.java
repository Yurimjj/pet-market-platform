package org.zerock.server.controller.order;

import lombok.RequiredArgsConstructor;
import org.zerock.server.dto.order.*;
import org.zerock.server.dto.product.ProductListResponseDto;
import org.zerock.server.service.order.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    // 거래 등록 (구매)
    @PostMapping
    public ResponseEntity<Long> registerTransaction(
            @RequestBody TransactionRegisterRequestDto dto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long transactionId = orderService.registerTransaction(dto, userDetails);
        return ResponseEntity.ok(transactionId);
    }

    // 거래 상세 조회
    @GetMapping("/{transactionId}")
    public ResponseEntity<TransactionDetailResponseDto> getTransactionDetail(
            @PathVariable Long transactionId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        TransactionDetailResponseDto response = orderService.getTransactionDetail(transactionId, userDetails);
        return ResponseEntity.ok(response);
    }

    // 내 거래 목록 조회 (페이징)
    @GetMapping
    public ResponseEntity<Page<TransactionListResponseDto>> getMyTransactions(
            Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Page<TransactionListResponseDto> page = orderService.getMyTransactions(pageable, userDetails);
        return ResponseEntity.ok(page);
    }

    // 거래 상태 변경 (예약중, 판매완료 등)
    @PatchMapping("/{transactionId}/status")
    public ResponseEntity<Void> updateTransactionStatus(
            @PathVariable Long transactionId,
            @RequestBody TransactionStatusUpdateRequestDto dto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        orderService.updateTransactionStatus(transactionId, dto, userDetails);
        return ResponseEntity.ok().build();
    }

    // 거래 삭제 (작성자, 관리자만)
    @DeleteMapping("/{transactionId}")
    public ResponseEntity<Void> deleteTransaction(
            @PathVariable Long transactionId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        orderService.deleteTransaction(transactionId, userDetails);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/transactions/active/me")
    public ResponseEntity<Map<String, Boolean>> hasActiveTxForMe(
            @RequestParam Long productId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        boolean active = orderService.hasActiveTransactionForMe(productId, userDetails);
        return ResponseEntity.ok(java.util.Map.of("active", active));
    }

    // ----- 리뷰 -----

    // 리뷰 등록 (거래 완료 후만)
    @PostMapping("/reviews")
    public ResponseEntity<Long> registerReview(
            @RequestBody ReviewRegisterRequestDto dto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long reviewId = orderService.registerReview(dto, userDetails);
        return ResponseEntity.ok(reviewId);
    }

    // 리뷰 삭제 (작성자, 관리자만)
    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        orderService.deleteReview(reviewId, userDetails);
        return ResponseEntity.ok().build();
    }

    // 리뷰 상세 조회
    @GetMapping("/reviews/{reviewId}")
    public ResponseEntity<ReviewDetailResponseDto> getReviewDetail(
            @PathVariable Long reviewId
    ) {
        ReviewDetailResponseDto response = orderService.getReviewDetail(reviewId);
        return ResponseEntity.ok(response);
    }

    // 내 거래 리뷰 목록 (페이징)
    @GetMapping("/reviews")
    public ResponseEntity<Page<ReviewListResponseDto>> getMyReviews(
            Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Page<ReviewListResponseDto> page = orderService.getMyReviews(pageable, userDetails);
        return ResponseEntity.ok(page);
    }

    // [ADD] 내 “예약 중” 상품 (구매자/판매자 관점)
    @GetMapping("/reserved")
    public ResponseEntity<Page<ProductListResponseDto>> getMyReserved(
            @RequestParam(defaultValue = "buyer") String role,
            Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Page<ProductListResponseDto> page =
                orderService.getMyReservedProducts(role, pageable, userDetails);
        return ResponseEntity.ok(page);
    }
}
