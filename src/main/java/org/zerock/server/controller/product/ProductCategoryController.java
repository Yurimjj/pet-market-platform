package org.zerock.server.controller.product;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.zerock.server.domain.product.ProductCategory;
import org.zerock.server.repository.product.ProductCategoryRepository;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/product-categories")
public class ProductCategoryController {
    private final ProductCategoryRepository categoryRepository;

    @GetMapping
    public List<ProductCategory> list() {
        return categoryRepository.findAll();
    }
}
