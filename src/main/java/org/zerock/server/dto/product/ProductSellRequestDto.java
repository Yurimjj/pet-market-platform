package org.zerock.server.dto.product;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ProductSellRequestDto {
    private Long buyerId;      // 우선 사용 권장
    private String buyerEmail; // buyerId가 없을 때 fallback (선택)
}
