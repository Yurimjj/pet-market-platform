package org.zerock.server.dto.pet;

import lombok.*;
import org.zerock.server.domain.pet.PetProfile;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class PetProfileListResponseDto {
    private Long petId;
    private String name;
    private Integer age;        // ✅ 추가
    private String bodyType;    // ✅ 추가
    private String breed;
    private String typeName;
    private String profileImageUrl;  // 파일명(뷰 URL 아님)

    /** 엔티티 → DTO (리스트용) */
    public static PetProfileListResponseDto of(PetProfile pet) {
        return PetProfileListResponseDto.builder()
                .petId(pet.getPetId())
                .name(pet.getName())
                .age(pet.getAge())                // ✅ 추가
                .bodyType(pet.getBodyType())      // ✅ 추가
                .breed(pet.getBreed())
                .typeName(pet.getPetType() != null ? pet.getPetType().getTypeName() : null)
                .profileImageUrl(pet.getProfileImageUrl())
                .build();
    }
}