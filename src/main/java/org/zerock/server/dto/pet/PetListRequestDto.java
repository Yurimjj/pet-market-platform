package org.zerock.server.dto.pet;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class PetListRequestDto {
    private Integer petTypeId;
    private Long ownerId;
    private String keyword;
}
