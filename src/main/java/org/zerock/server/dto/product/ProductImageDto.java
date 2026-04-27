package org.zerock.server.dto.product;

import lombok.*;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ProductImageDto {
    private Long imageId;
    private String imageUrl;
    private boolean isThumbnail;
}
