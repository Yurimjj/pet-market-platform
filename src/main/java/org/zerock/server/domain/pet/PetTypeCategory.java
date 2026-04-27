package org.zerock.server.domain.pet;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tb_pet_type_category")
public class PetTypeCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer petTypeId; // 반려동물 종류 ID

    @Column(name = "type_name", unique = true, nullable = false, length = 50)
    private String typeName; // 반려동물 종류명 (예: 강아지, 고양이)
}
