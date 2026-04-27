package org.zerock.server.dto.order;

import lombok.*;
import org.zerock.server.dto.product.ProductListResponseDto;
import org.zerock.server.dto.product.ProductSellerDto;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class TransactionDetailResponseDto {
    private Long transactionId;
    private ProductListResponseDto product;
    private ProductSellerDto buyer;
    private ProductSellerDto seller;
    private java.sql.Timestamp transactionDate;
    private java.math.BigDecimal finalPrice;
    private String transactionStatus; // 예: "판매", "나눔", "예약중", "판매완료"
}
