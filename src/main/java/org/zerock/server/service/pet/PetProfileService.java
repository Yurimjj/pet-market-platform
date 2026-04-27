package org.zerock.server.service.pet;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.zerock.server.dto.pet.*;

public interface PetProfileService {
    Long registerPet(PetProfileRegisterRequestDto dto, Long userId);
    void updatePet(Long petId, PetProfileUpdateRequestDto dto, Long userId);
    void deletePet(Long petId, Long userId);

    PetProfileDetailResponseDto getPetDetail(Long petId, UserDetails userDetails);

    Page<PetProfileListResponseDto> getPetList(Pageable pageable,
                                               Integer petTypeId,
                                               Long ownerId,
                                               String keyword);
}
