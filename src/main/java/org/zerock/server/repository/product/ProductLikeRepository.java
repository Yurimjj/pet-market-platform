package org.zerock.server.repository.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;          // [ADD]
import org.zerock.server.domain.product.ProductLike;
import org.zerock.server.domain.product.ProductInfo;
import org.zerock.server.domain.user.UserInfo;

import java.util.Optional;

public interface ProductLikeRepository extends JpaRepository<ProductLike, Long> {

    // 특정 상품에 대한 특정 유저의 찜 정보 조회 (토글용)
    Optional<ProductLike> findByUserInfoAndProduct(UserInfo userInfo, ProductInfo product);

    // 특정 상품의 찜 개수 조회
    Long countByProduct(ProductInfo product);

    // ★ 추가: 상품이 소프트 삭제되지 않은 것만
    Page<ProductLike> findAllByUserInfo_UserIdAndProduct_IsDeletedFalse(Long userId, Pageable pageable);

    // --------------------------------------------------------------------
    // [CHG] 정리용: 특정 상품의 찜 레코드 전부 삭제 — 메서드 1개만 유지
    // --------------------------------------------------------------------
    @Modifying                                              // [ADD]
    long deleteByProduct_ProductId(Long productId);         // [CHG]

    // --------------------------------------------------------------------
    // 상품 찜하기 (조회)
    // --------------------------------------------------------------------
    // 기존: 전체 리스트
    java.util.List<ProductLike> findAllByUserInfo_UserId(Long userId);

    // 추가: 페이징 조회
    Page<ProductLike> findAllByUserInfo_UserId(Long userId, Pageable pageable);
}
