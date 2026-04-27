package org.zerock.server.repository.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.server.domain.product.ProductCategory;

import java.util.List;

public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Integer> {
    // 상위 카테고리별 하위 카테고리 조회
    List<ProductCategory> findAllByParentCategory_CategoryId(Integer parentId);

    // 반려동물 종류별 카테고리 조회
    List<ProductCategory> findAllByPetTypeCategory_PetTypeId(Integer petTypeId);
}
