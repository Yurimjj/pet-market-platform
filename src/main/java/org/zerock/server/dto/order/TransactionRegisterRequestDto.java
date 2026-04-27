package org.zerock.server.dto.order;

import lombok.*;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class TransactionRegisterRequestDto {
    private Long productId;    // 거래할 상품 ID
    private Long buyerId;      // 구매자(로그인 유저)
    private java.math.BigDecimal finalPrice; // 거래 가격(협의된 가격)
}
