package org.zerock.server.dto.pet;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class PetProfileUpdateRequestDto {
    private String name;
    private Integer age;
    private String bodyType;
    private String breed;
    private Integer petTypeId;
    private String content;

    // ✅ 새로 올리는 이미지(선택)
    private MultipartFile image;

    // 컨트롤러에서 저장된 새 파일명을 서비스로 넘기기 위한 필드(선택)
    private String uploadFileName;

    // [ADD] 성별/중성화
    private String gender;
    private Boolean neutered;
}
