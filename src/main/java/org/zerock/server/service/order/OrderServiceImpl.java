package org.zerock.server.service.order;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.zerock.server.domain.order.*;
import org.zerock.server.domain.product.ProductInfo;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.domain.user.UserRole;

import org.zerock.server.dto.order.*;
import org.zerock.server.dto.product.ProductListResponseDto;
import org.zerock.server.dto.product.ProductSellerDto;

import org.zerock.server.repository.order.*;
import org.zerock.server.repository.product.ProductInfoRepository;
import org.zerock.server.repository.user.UserInfoRepository;

import java.util.Objects;
import java.util.Optional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final TransactionHistoryRepository transactionHistoryRepository;
    private final ReviewInfoRepository reviewInfoRepository;
    private final ProductInfoRepository productInfoRepository;
    private final UserInfoRepository userInfoRepository;

    @PersistenceContext
    private EntityManager em;

    // --- 상태 문자열(영/한 혼용 대응) ---
    private static final String STATUS_RESERVED_KO = "예약중";
    private static final String STATUS_RESERVED_KO_WITH_SPACE = "예약 중";
    private static final String STATUS_RESERVED_EN = "RESERVED";
    private static final String STATUS_CLOSED_KO   = "판매완료";
    private static final String STATUS_SELLING_EN  = "SELLING";

    // [CHG] 거래 등록 로직: 판매자도 생성 가능 + 생성 즉시 "예약중" 반영
    @Transactional
    @Override
    public Long registerTransaction(TransactionRegisterRequestDto dto, UserDetails userDetails) {
        UserInfo me = getUser(userDetails);
        ProductInfo product = productInfoRepository.findById(dto.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("상품 없음"));

        // me가 판매자인 경우: dto.buyerId가 필수
        UserInfo buyer;
        if (Objects.equals(product.getSeller().getUserId(), me.getUserId())) {
            if (dto.getBuyerId() == null) throw new IllegalArgumentException("buyerId 필요");
            buyer = userInfoRepository.findById(dto.getBuyerId())
                    .orElseThrow(() -> new IllegalArgumentException("구매자 없음"));
        } else {
            // me가 구매자인 경우(기존 동작 호환)
            buyer = me;
            if (Objects.equals(product.getSeller().getUserId(), buyer.getUserId())) {
                throw new IllegalArgumentException("본인 상품은 구매 불가");
            }
        }

        // 동일 buyer로 이미 거래가 있으면 재사용(idempotent)
        Optional<TransactionHistory> mine =
                transactionHistoryRepository.findTopByProduct_ProductIdAndBuyer_UserIdOrderByTransactionIdDesc(
                        product.getProductId(), buyer.getUserId());
        if (mine.isPresent()) {
            return mine.get().getTransactionId();
        }

        // 이미 예약/거래중이면 생성 불가
        if (!"SELLING".equalsIgnoreCase(product.getStatus())) {
            throw new IllegalStateException("이미 예약/거래중인 상품");
        }

        TransactionHistory transaction = TransactionHistory.builder()
                .product(product)
                .buyer(buyer)
                .seller(product.getSeller())
                .finalPrice(dto.getFinalPrice())
                // [CHG] 생성 즉시 예약 상태로
                .transactionStatus("예약중")
                .build();
        TransactionHistory saved = transactionHistoryRepository.save(transaction);

        // [ADD] 상품도 예약으로 반영
        product.setStatus("RESERVED");
        productInfoRepository.save(product);

        return saved.getTransactionId();
    }

    // ========================= 거래 상세 조회 =========================
    @Transactional(readOnly = true)
    @Override
    public TransactionDetailResponseDto getTransactionDetail(Long transactionId, UserDetails userDetails) {
        TransactionHistory t = transactionHistoryRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("거래 없음"));

        return TransactionDetailResponseDto.builder()
                .transactionId(t.getTransactionId())
                .product(ProductListResponseDto.builder()
                        .productId(t.getProduct().getProductId())
                        .title(t.getProduct().getTitle())
                        .price(t.getProduct().getPrice())
                        .thumbnailUrl(firstImageFileName(t.getProduct())) // ✅ 썸네일 파일명 내려줌
                        .conditionStatus(t.getProduct().getConditionStatus())
                        .tradeLocation(t.getProduct().getTradeLocation())
                        .status(t.getProduct().getStatus())
                        .viewCount(t.getProduct().getViewCount())
                        .isLiked(false)
                        .category(null)
                        .seller(null)
                        .tags(null)
                        .build())
                .buyer(ProductSellerDto.builder()
                        .userId(t.getBuyer().getUserId())
                        .nickname(t.getBuyer().getNickname())
                        .region(t.getBuyer().getRegion())
                        .build())
                .seller(ProductSellerDto.builder()
                        .userId(t.getSeller().getUserId())
                        .nickname(t.getSeller().getNickname())
                        .region(t.getSeller().getRegion())
                        .build())
                .transactionDate(t.getTransactionDate())
                .finalPrice(t.getFinalPrice())
                .transactionStatus(t.getTransactionStatus())
                .build();
    }

    // ========================= 내가 참여한 거래 목록(전체) =========================
    @Transactional(readOnly = true)
    @Override
    public Page<TransactionListResponseDto> getMyTransactions(Pageable pageable, UserDetails userDetails) {
        UserInfo user = getUser(userDetails);

        Page<TransactionHistory> transactions = transactionHistoryRepository
                .findAllByBuyer_UserIdOrSeller_UserId(user.getUserId(), user.getUserId(), pageable);

        return transactions.map(t -> TransactionListResponseDto.builder()
                .transactionId(t.getTransactionId())
                .productId(t.getProduct().getProductId())
                .productTitle(t.getProduct().getTitle())
                .finalPrice(t.getFinalPrice())
                .transactionStatus(t.getTransactionStatus())
                .transactionDate(t.getTransactionDate())
                .build());
    }

    // ========================= (★교체) 내 예약중 상품 목록 =========================
    @Transactional(readOnly = true)
    @Override
    public Page<ProductListResponseDto> getMyReservedProducts(
            String role, Pageable pageable, UserDetails userDetails) {

        UserInfo me = getUser(userDetails);
        boolean asSeller = "seller".equalsIgnoreCase(role);

        java.util.List<String> rlist = java.util.List.of(
                STATUS_RESERVED_KO.toLowerCase(),
                STATUS_RESERVED_KO_WITH_SPACE.toLowerCase(),
                STATUS_RESERVED_EN.toLowerCase()
        );

        // ---- [공통] 거래 기반 (buyer/seller 공통) ----
        String rolePredicate = asSeller ? "t.seller.userId = :uid" : "t.buyer.userId = :uid";
        String reservedPredicate =
                "( lower(t.transactionStatus) in (:rlist) OR lower(p.status) in (:rlist) )";
        String fromWhereTx = " FROM TransactionHistory t JOIN t.product p " +
                " WHERE " + rolePredicate + " AND " + reservedPredicate + " AND p.isDeleted = false ";

        Long viaTxTotal = em.createQuery("SELECT COUNT(t) " + fromWhereTx, Long.class)
                .setParameter("uid", me.getUserId())
                .setParameter("rlist", rlist)
                .getSingleResult();

        java.util.List<ProductInfo> viaTxProducts = em.createQuery(
                        "SELECT p " + fromWhereTx + " ORDER BY t.transactionId DESC", ProductInfo.class)
                .setParameter("uid", me.getUserId())
                .setParameter("rlist", rlist)
                .setFirstResult((int) pageable.getOffset())
                .setMaxResults(pageable.getPageSize())
                .getResultList();

        if (!asSeller) {
            java.util.List<ProductListResponseDto> content = viaTxProducts.stream()
                    .map(this::toProductListDto)
                    .toList();
            return new PageImpl<>(content, pageable, viaTxTotal);
        }

        // ---- [판매자 전용] 상품 기반 (거래 없이도 '상품 상태=예약'이면 포함) ----
        String fromWhereProductOnly =
                " FROM ProductInfo p " +
                        " WHERE p.seller.userId = :uid " +
                        "   AND lower(p.status) in (:rlist) " +
                        "   AND p.isDeleted = false ";

        Long viaProductOnlyTotal = em.createQuery(
                        "SELECT COUNT(p) " + fromWhereProductOnly, Long.class)
                .setParameter("uid", me.getUserId())
                .setParameter("rlist", rlist)
                .getSingleResult();

        java.util.List<ProductInfo> viaProductOnlyRows = em.createQuery(
                        "SELECT p " + fromWhereProductOnly + " ORDER BY p.productId DESC", ProductInfo.class)
                .setParameter("uid", me.getUserId())
                .setParameter("rlist", rlist)
                .setFirstResult((int) pageable.getOffset())
                .setMaxResults(pageable.getPageSize())
                .getResultList();

        java.util.Map<Long, ProductInfo> merged = new java.util.LinkedHashMap<>();
        for (ProductInfo p : viaTxProducts) merged.put(p.getProductId(), p);
        for (ProductInfo p : viaProductOnlyRows) merged.putIfAbsent(p.getProductId(), p);

        java.util.List<ProductListResponseDto> content = merged.values().stream()
                .map(this::toProductListDto)
                .toList();

        long approxTotal = viaTxTotal + viaProductOnlyTotal;

        return new PageImpl<>(content, pageable, approxTotal);
    }

    // ========================= 거래 상태 변경 =========================
    @Transactional
    @Override
    public void updateTransactionStatus(Long transactionId, TransactionStatusUpdateRequestDto dto, UserDetails userDetails) {
        UserInfo user = getUser(userDetails);
        TransactionHistory transaction = transactionHistoryRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("거래 없음"));

        boolean isAdmin = hasRole(user, UserRole.ADMIN);

        if (!transaction.getBuyer().getUserId().equals(user.getUserId())
                && !transaction.getSeller().getUserId().equals(user.getUserId())
                && !isAdmin) {
            throw new SecurityException("상태 변경 권한 없음");
        }

        transaction.setTransactionStatus(dto.getTransactionStatus());
        transactionHistoryRepository.save(transaction);

        ProductInfo product = transaction.getProduct();
        product.setStatus(dto.getTransactionStatus());
        productInfoRepository.save(product);
    }

    // ========================= 거래 삭제 =========================
    @Transactional
    @Override
    public void deleteTransaction(Long transactionId, UserDetails userDetails) {
        UserInfo user = getUser(userDetails);
        TransactionHistory transaction = transactionHistoryRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("거래 없음"));

        boolean isAdmin = hasRole(user, UserRole.ADMIN);

        if (!transaction.getBuyer().getUserId().equals(user.getUserId())
                && !transaction.getSeller().getUserId().equals(user.getUserId())
                && !isAdmin) {
            throw new SecurityException("삭제 권한 없음");
        }

        transactionHistoryRepository.delete(transaction);
    }

    // ========================= 나의 활성 거래 여부 =========================
    @Transactional(readOnly = true)
    @Override
    public boolean hasActiveTransactionForMe(Long productId, UserDetails userDetails) {
        UserInfo me = getUser(userDetails);
        final String CLOSED = STATUS_CLOSED_KO;

        return transactionHistoryRepository
                .existsByProduct_ProductIdAndBuyer_UserIdAndTransactionStatusNot(
                        productId, me.getUserId(), CLOSED
                );
    }

    // ========================= 리뷰 등록/삭제/조회 =========================
    @Transactional
    @Override
    public Long registerReview(ReviewRegisterRequestDto dto, UserDetails userDetails) {
        UserInfo reviewer = getUser(userDetails);

        TransactionHistory transaction = transactionHistoryRepository.findById(dto.getTransactionId())
                .orElseThrow(() -> new IllegalArgumentException("거래 없음"));

        if (!STATUS_CLOSED_KO.equals(transaction.getTransactionStatus())) {
            throw new IllegalStateException("거래 완료 후에만 리뷰 작성 가능");
        }

        if (reviewInfoRepository.findByTransaction_TransactionId(dto.getTransactionId()).isPresent()) {
            throw new IllegalArgumentException("이미 리뷰가 존재");
        }

        UserInfo reviewee = transaction.getSeller().getUserId().equals(reviewer.getUserId())
                ? transaction.getBuyer() : transaction.getSeller();

        ReviewInfo review = ReviewInfo.builder()
                .transaction(transaction)
                .reviewer(reviewer)
                .reviewee(reviewee)
                .rating(dto.getRating())
                .content(dto.getContent())
                .build();

        ReviewInfo saved = reviewInfoRepository.save(review);
        return saved.getReviewId();
    }

    @Transactional
    @Override
    public void deleteReview(Long reviewId, UserDetails userDetails) {
        UserInfo user = getUser(userDetails);

        ReviewInfo review = reviewInfoRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰 없음"));

        boolean isAdmin = hasRole(user, UserRole.ADMIN);

        if (!review.getReviewer().getUserId().equals(user.getUserId())
                && !isAdmin) {
            throw new SecurityException("리뷰 삭제 권한 없음");
        }

        reviewInfoRepository.delete(review);
    }

    @Transactional(readOnly = true)
    @Override
    public ReviewDetailResponseDto getReviewDetail(Long reviewId) {
        ReviewInfo review = reviewInfoRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰 없음"));

        return ReviewDetailResponseDto.builder()
                .reviewId(review.getReviewId())
                .transactionId(review.getTransaction().getTransactionId())
                .reviewerNickname(review.getReviewer().getNickname())
                .revieweeNickname(review.getReviewee().getNickname())
                .rating(review.getRating())
                .content(review.getContent())
                .createdAt(review.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    @Override
    public Page<ReviewListResponseDto> getMyReviews(Pageable pageable, UserDetails userDetails) {
        UserInfo user = getUser(userDetails);

        Page<ReviewInfo> reviews = reviewInfoRepository.findAllByReviewer_UserId(user.getUserId(), pageable);

        return reviews.map(r -> ReviewListResponseDto.builder()
                .reviewId(r.getReviewId())
                .transactionId(r.getTransaction().getTransactionId())
                .reviewerNickname(r.getReviewer().getNickname())
                .rating(r.getRating())
                .content(r.getContent())
                .createdAt(r.getCreatedAt())
                .build());
    }

    // ========================= 유틸 =========================
    private UserInfo getUser(UserDetails userDetails) {
        if (userDetails == null) throw new SecurityException("인증 필요");
        return userInfoRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("사용자 정보 없음"));
    }

    private boolean hasRole(UserInfo user, UserRole role) {
        return user.getUserRoleList() != null && user.getUserRoleList().contains(role);
    }

    // ✅ 썸네일 파일명 추출 (첫 번째 이미지)
    private String firstImageFileName(ProductInfo p) {
        if (p == null || p.getImages() == null || p.getImages().isEmpty()) return null;
        // 프로젝트에서 이미지 엔티티의 파일명 필드가 imageUrl 로 쓰이고,
        // 컨트롤러에서 /api/products/view/{fileName} 으로 노출하는 구조였음
        return p.getImages().iterator().next().getImageUrl();
    }

    // ProductInfo → 목록 DTO 매핑 (썸네일 포함)
    private ProductListResponseDto toProductListDto(ProductInfo p) {
        if (p == null) return null;
        return ProductListResponseDto.builder()
                .productId(p.getProductId())
                .title(p.getTitle())
                .price(p.getPrice())
                .thumbnailUrl(firstImageFileName(p)) // ✅ 여기서 파일명 내려줌
                .conditionStatus(p.getConditionStatus())
                .tradeLocation(p.getTradeLocation())
                .status(p.getStatus())
                .viewCount(p.getViewCount())
                .isLiked(false)
                .category(null)
                .seller(null)
                .tags(null)
                .build();
    }
}
