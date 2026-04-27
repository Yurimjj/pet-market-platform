package org.zerock.server.dto.order;

import lombok.*;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ReviewRegisterRequestDto {
    private Long transactionId; // 거래 ID
    private int rating;         // 평점 (1~5)
    private String content;     // 리뷰 내용
}
