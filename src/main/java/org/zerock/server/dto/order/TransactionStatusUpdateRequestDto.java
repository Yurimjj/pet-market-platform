package org.zerock.server.dto.order;

import lombok.*;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class TransactionStatusUpdateRequestDto {
    private String transactionStatus; // "예약중", "판매완료" 등
}
