package org.zerock.server.repository.pet;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.server.domain.pet.PetProfile;

public interface PetProfileRepository extends JpaRepository<PetProfile, Long> {

    // tb_pet_profile.user_id -> PetProfile.user.userId
    Page<PetProfile> findAllByUser_UserId(Long userId, Pageable pageable);

    // tb_pet_profile.pet_type_id -> PetProfile.petType.petTypeId
    Page<PetProfile> findAllByPetType_PetTypeId(Integer petTypeId, Pageable pageable);

    Page<PetProfile> findAllByNameContaining(String keyword, Pageable pageable);
}
