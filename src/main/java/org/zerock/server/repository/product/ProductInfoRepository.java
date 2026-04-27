package org.zerock.server.repository.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.zerock.server.domain.product.ProductInfo;

public interface ProductInfoRepository extends JpaRepository<ProductInfo, Long> {
    // 기본 CRUD + 페이징
    Page<ProductInfo> findAllByIsDeletedFalse(Pageable pageable);

    // 카테고리별 상품 목록 (삭제 안 된 것만)
    Page<ProductInfo> findAllByCategory_CategoryIdAndIsDeletedFalse(Integer categoryId, Pageable pageable);

    // 판매자별 상품 목록
    Page<ProductInfo> findAllBySeller_UserIdAndIsDeletedFalse(Long userId, Pageable pageable);

    // 상품명(키워드) 검색
    Page<ProductInfo> findAllByTitleContainingAndIsDeletedFalse(String keyword, Pageable pageable);

    // 상태별 상품 목록 (예: SELLING, RESERVED, SOLD 등)
    Page<ProductInfo> findAllByStatusAndIsDeletedFalse(String status, Pageable pageable);

    // 구매자 기준(내 구매 내역)
    Page<ProductInfo> findAllByBuyer_UserIdAndIsDeletedFalse(Long userId, Pageable pageable);

    // 판매자 + 상태 SOLD (판매 내역: 편의 메서드)
    Page<ProductInfo> findAllBySeller_UserIdAndStatusAndIsDeletedFalse(Long sellerId, String status, Pageable pageable);

    Page<ProductInfo> findAllByBuyer_UserIdAndBuyerConfirmedAtIsNotNullAndSellerConfirmedAtIsNotNullAndIsDeletedFalse(
            Long userId, Pageable pageable);

    // [ADD] 구매 내역: 삭제 여부와 상관없이(soft delete 포함) 내가 구매 확정한 상품 조회
    Page<ProductInfo> findAllByBuyer_UserIdAndBuyerConfirmedAtIsNotNullAndSellerConfirmedAtIsNotNull(
            Long buyerId, Pageable pageable);



    // ★ 추가: 제목 OR 태그명으로 검색 (중복 방지 위해 DISTINCT)
    @Query("""
        select distinct p
        from ProductInfo p
        left join p.tagRelations tr
        left join tr.tag t
        where p.isDeleted = false
          and (
                lower(p.title)   like lower(concat('%', :keyword, '%'))
             or lower(t.tagName) like lower(concat('%', :keyword, '%'))
          )
    """)
    // distinct : 태그가 여러 개 매치되더라도 상품은 1번만 나오게 함.

    Page<ProductInfo> searchByTitleOrTag(@Param("keyword") String keyword, Pageable pageable);

}
