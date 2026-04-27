package org.zerock.server.repository.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.server.domain.product.ProductTagRelation;

import java.util.List;

public interface ProductTagRelationRepository extends JpaRepository<ProductTagRelation, Long> {
    // 특정 상품에 연결된 태그 관계 조회
    List<ProductTagRelation> findAllByProduct_ProductId(Long productId);

    // 특정 태그가 연결된 상품 관계 조회
    List<ProductTagRelation> findAllByTag_TagId(Integer tagId);

    // 상품ID와 태그ID로 존재 여부 조회 (중복 방지)
    boolean existsByProduct_ProductIdAndTag_TagId(Long productId, Integer tagId);

    // 상품의 모든 태그 관계 삭제 (상품 삭제시 활용)
    void deleteAllByProduct_ProductId(Long productId);

    // 태그의 모든 상품 관계 삭제 (태그 삭제시 활용)
    void deleteAllByTag_TagId(Integer tagId);
}
