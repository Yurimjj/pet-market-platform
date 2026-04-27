package org.zerock.server.repository.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.server.domain.product.ProductTag;

import java.util.Optional;

public interface ProductTagRepository extends JpaRepository<ProductTag, Integer> {
    // 태그명으로 태그 조회 (중복 방지)
    Optional<ProductTag> findByTagName(String tagName);

    // 태그명 일부로 검색 (예: 자동완성)
    java.util.List<ProductTag> findAllByTagNameContaining(String keyword);
}
