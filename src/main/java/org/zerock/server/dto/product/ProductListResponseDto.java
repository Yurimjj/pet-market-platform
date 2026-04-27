package org.zerock.server.dto.product;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ProductListResponseDto {
    private Long productId;
    private String title;
    private BigDecimal price;
    private String thumbnailUrl;
    private String conditionStatus;
    private String addr;
    private String tradeLocation;
    private String status;
    private int viewCount;
    private boolean isLiked; // 로그인 유저가 찜했는지
    private ProductCategoryDto category;
    private ProductSellerDto seller;
    private List<String> tags;

    // 클래스 필드에 추가 (목록에서도 최소 정보)
    private Long buyerId;
    private java.time.LocalDateTime soldAt;
}
