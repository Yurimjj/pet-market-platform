package org.zerock.server.dto.product;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ProductDetailResponseDto {
    private Long productId;
    private String title;
    private String description;
    private BigDecimal price;
    private String conditionStatus;
    private String tradeMethod;
    private String addr;
    private String status;
    private int viewCount;
    private boolean isLiked;
    private ProductCategoryDto category;
    private ProductSellerDto seller;
    private List<ProductImageDto> images;
    private List<String> tags;

    // 클래스 필드에 추가
    private Long buyerId;                 // 구매자 식별
    private String buyerNickname;         // 선택적 표시
    private java.time.LocalDateTime soldAt;
    private java.time.LocalDateTime sellerConfirmedAt;
    private java.time.LocalDateTime buyerConfirmedAt;
}
