package org.zerock.server.domain.pet;

import jakarta.persistence.*;
import lombok.*;
import org.zerock.server.domain.user.UserInfo;
import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tb_pet_profile")
public class PetProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pet_id") // DB 컬럼 이름 명시
    private Long petId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserInfo user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_type_id", nullable = false)
    private PetTypeCategory petType;

    @Column(nullable = false, length = 100)
    private String name;

    @Column
    private Integer age;

    @Column(length = 100)
    private String breed;

    @Column(length = 50)
    private String bodyType;

    @Column(name = "profile_image_url", length = 255) // DB 컬럼 이름 명시
    private String profileImageUrl;

    @Column(name="content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "created_at", updatable = false, insertable = false)
    private Timestamp createdAt;

    @Column(name = "updated_at", updatable = false, insertable = false)
    private Timestamp updatedAt;

    // [ADD] 성별/중성화 필드 추가
    @Column(length = 10)
    private String gender; // "MALE" | "FEMALE"

    @Column(columnDefinition = "TINYINT(1)")
    private Boolean neutered; // true/false
}