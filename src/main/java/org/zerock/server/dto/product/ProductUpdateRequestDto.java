package org.zerock.server.dto.product;

import lombok.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ProductUpdateRequestDto {
    private String title;
    private String description;
    private BigDecimal price;
    private String conditionStatus;
    private String tradeMethod;
    private String addr;
    private Integer categoryId;
    private List<String> tagNames;
    private String status; // (SELLING, RESERVED, SOLD 등)

    // 선생님 스타일: 수정 후 최종적으로 유지할 파일명 목록(기존 유지 + 신규 업로드)
    @Builder.Default
    private List<String> uploadFileNames = new ArrayList<>();
}
