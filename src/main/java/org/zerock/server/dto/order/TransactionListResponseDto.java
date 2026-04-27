package org.zerock.server.dto.order;

import lombok.*;
import java.math.BigDecimal;
import java.sql.Timestamp;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class TransactionListResponseDto {
    private Long transactionId;
    private Long productId;
    private String productTitle;
    private BigDecimal finalPrice;
    private String transactionStatus;
    private Timestamp transactionDate;
}
