package org.zerock.server.dto.pet;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder @ToString
public class PetProfileRegisterRequestDto {
    // ---- 텍스트 필드들 (FormData에 같은 이름으로 넣어주면 자동 바인딩) ----
    private String name;
    private Integer age;
    private String bodyType;
    private String breed;
    private Integer petTypeId;   // FK (예: 강아지/고양이 카테고리)
    private String content;

    // ---- 파일 필드 (이미지 1장 가정) ----
    // FormData에 image 키로 넣으면 여기로 바인딩된다.
    private MultipartFile image;

    // 컨트롤러에서 파일을 저장하면 결과 파일명을 여기에 세팅해서 서비스로 넘긴다.
    private String uploadFileName;

    // [ADD] 성별/중성화
    private String gender;
    private Boolean neutered;
}
