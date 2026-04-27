package org.zerock.server.repository.pet;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.server.domain.pet.PetTypeCategory;

public interface PetTypeCategoryRepository extends JpaRepository<PetTypeCategory, Integer> {}
