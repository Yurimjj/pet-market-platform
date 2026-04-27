package org.zerock.server.dto.product;

import lombok.*;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ProductTagDto {
    private Integer tagId;
    private String tagName;
}
