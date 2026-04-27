package org.zerock.server.dto.product;

import lombok.*;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ProductLikeResponseDto {
    private Long productId;
    private boolean liked; // true: 찜됨, false: 찜취소
    private int likeCount;
}
