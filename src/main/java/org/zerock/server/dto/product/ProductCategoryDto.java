package org.zerock.server.dto.product;

import lombok.*;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ProductCategoryDto {
    private Integer categoryId;
    private String categoryName;
    private Integer parentCategoryId;
    private Integer petTypeId;
}
