package org.zerock.server.dto.product;

import lombok.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ProductRegisterRequestDto {
    private String title;
    private String description;
    private BigDecimal price;
    private String conditionStatus;
    private String tradeMethod;
    private String addr;
    private Integer categoryId;
    private List<String> tagNames;

    // 선생님 스타일: 컨트롤러에서 파일 저장 후 파일명들을 DTO로 내려보냄
    @Builder.Default
    private List<String> uploadFileNames = new ArrayList<>();
}
