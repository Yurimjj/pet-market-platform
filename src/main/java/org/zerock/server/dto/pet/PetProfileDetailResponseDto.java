package org.zerock.server.dto.pet;

import lombok.*;
import org.zerock.server.domain.pet.PetProfile;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class PetProfileDetailResponseDto {
    private Long petId;
    private Long ownerId;            // user.userId
    private String name;
    private Integer age;
    private String bodyType;
    private String breed;
    private Integer petTypeId;
    private String typeName;
    private String profileImageUrl;  // 파일명(뷰 URL 아님)
    private String content;
    // [ADD]
    private String gender;
    private Boolean neutered;

    /** 엔티티 → DTO (상세용) */
    public static PetProfileDetailResponseDto of(PetProfile pet) {
        Integer petTypeId = pet.getPetType() != null ? pet.getPetType().getPetTypeId() : null;
        String typeName   = pet.getPetType() != null ? pet.getPetType().getTypeName()   : null;

        return PetProfileDetailResponseDto.builder()
                .petId(pet.getPetId())
                .ownerId(pet.getUser() != null ? pet.getUser().getUserId() : null)
                .name(pet.getName())
                .age(pet.getAge())
                .bodyType(pet.getBodyType())
                .breed(pet.getBreed())
                .gender(pet.getGender())
                .neutered(Boolean.TRUE.equals(pet.getNeutered()))
                .petTypeId(petTypeId)
                .typeName(typeName)
                .profileImageUrl(pet.getProfileImageUrl())
                .content(pet.getContent())
                .build();
    }
}
