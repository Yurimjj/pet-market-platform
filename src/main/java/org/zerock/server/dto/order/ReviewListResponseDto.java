package org.zerock.server.dto.order;

import lombok.*;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ReviewListResponseDto {
    private Long reviewId;
    private Long transactionId;
    private String reviewerNickname;
    private int rating;
    private String content;
    private java.sql.Timestamp createdAt;
}
