package org.zerock.server.repository.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.server.domain.product.ProductImage;

import java.util.List;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    // 상품별 이미지 조회
    List<ProductImage> findAllByProduct_ProductId(Long productId);

    // 썸네일만 조회
    ProductImage findByProduct_ProductIdAndIsThumbnailTrue(Long productId);
}
