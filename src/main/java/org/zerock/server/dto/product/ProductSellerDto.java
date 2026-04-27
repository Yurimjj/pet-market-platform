package org.zerock.server.dto.product;

import lombok.*;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ProductSellerDto {
    private Long userId;
    private String nickname;
    private String region;
}
