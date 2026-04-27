package org.zerock.server.service.pet;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.server.domain.pet.PetProfile;
import org.zerock.server.domain.pet.PetTypeCategory;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.dto.pet.*;
import org.zerock.server.repository.pet.PetProfileRepository;
import org.zerock.server.repository.pet.PetTypeCategoryRepository;
import org.zerock.server.repository.user.UserInfoRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class PetProfileServiceImpl implements PetProfileService {

    private final PetProfileRepository petProfileRepository;
    private final PetTypeCategoryRepository petTypeCategoryRepository;
    private final UserInfoRepository userInfoRepository;

    @Override
    public Long registerPet(PetProfileRegisterRequestDto dto, Long userId) {
        UserInfo user = userInfoRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        PetTypeCategory type = null;
        if (dto.getPetTypeId() != null) {
            type = petTypeCategoryRepository.findById(dto.getPetTypeId())
                    .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 PetTypeId"));
        }

        // [변경] 파일명 저장 시 "빈 값", "경로 포함" 방지 → 뷰 URL 생성 시 안정성 확보
        final String savedFileName = sanitizeStoredFileName(dto.getUploadFileName());

        PetProfile pet = PetProfile.builder()
                .name(dto.getName())
                .age(dto.getAge())
                .bodyType(dto.getBodyType())
                .breed(dto.getBreed())
                .gender(dto.getGender()) // [ADD]
                .neutered(Boolean.TRUE.equals(dto.getNeutered())) // [ADD]
                .profileImageUrl(savedFileName) // [유지] 컨트롤러에서 저장한 파일명(파일명만)
                .content(dto.getContent())
                .build();

        pet.setUser(user);
        if (type != null) pet.setPetType(type);

        return petProfileRepository.save(pet).getPetId();
    }

    @Override
    public void updatePet(Long petId, PetProfileUpdateRequestDto dto, Long userId) {
        PetProfile pet = petProfileRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("펫 프로필 없음"));

        if (!pet.getUser().getUserId().equals(userId)) {
            throw new SecurityException("수정 권한 없음");
        }

        if (dto.getName() != null) pet.setName(dto.getName());
        if (dto.getAge() != null) pet.setAge(dto.getAge());
        if (dto.getBodyType() != null) pet.setBodyType(dto.getBodyType());
        if (dto.getBreed() != null) pet.setBreed(dto.getBreed());
        if (dto.getGender() != null)   pet.setGender(dto.getGender());       // [ADD]
        if (dto.getNeutered() != null) pet.setNeutered(dto.getNeutered());   // [ADD]
        if (dto.getContent() != null) pet.setContent(dto.getContent());

        if (dto.getPetTypeId() != null) {
            PetTypeCategory type = petTypeCategoryRepository.findById(dto.getPetTypeId())
                    .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 PetTypeId"));
            pet.setPetType(type);
        }

        // [변경] 새 파일명이 "실제로 존재"할 때만 교체 (빈 문자열/경로 포함 방지)
        if (isNotBlank(dto.getUploadFileName())) {
            String newFileName = sanitizeStoredFileName(dto.getUploadFileName());

            // (선택) 기존 파일 삭제가 필요하면 여기에서 삭제 처리
            // ex) customFileUtil.removeFile(pet.getProfileImageUrl());

            pet.setProfileImageUrl(newFileName);
        }

        petProfileRepository.save(pet);
    }

    @Override
    public void deletePet(Long petId, Long userId) {
        PetProfile pet = petProfileRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("펫 프로필 없음"));

        if (!pet.getUser().getUserId().equals(userId)) {
            throw new SecurityException("삭제 권한 없음");
        }

        // (선택) 실제 파일 삭제가 필요하면 여기에서 삭제 처리
        // ex) customFileUtil.removeFile(pet.getProfileImageUrl());

        petProfileRepository.delete(pet); // 소프트삭제가 필요하면 구현 변경
    }

    @Override
    // [CHG] 공개 조회 허용
    @Transactional(readOnly = true)
    public PetProfileDetailResponseDto getPetDetail(Long petId, UserDetails userDetails) {
        PetProfile pet = petProfileRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("펫 프로필 없음"));

        return toDetailDto(pet);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PetProfileListResponseDto> getPetList(Pageable pageable, Integer petTypeId, Long ownerId, String keyword) {
        // [유지] 파라미터에 따라 분기
        if (petTypeId != null) {
            return petProfileRepository.findAllByPetType_PetTypeId(petTypeId, pageable)
                    .map(this::toListDto);
        }
        if (ownerId != null) {
            return petProfileRepository.findAllByUser_UserId(ownerId, pageable)
                    .map(this::toListDto);
        }
        if (keyword != null && !keyword.isBlank()) {
            return petProfileRepository.findAllByNameContaining(keyword, pageable)
                    .map(this::toListDto);
        }
        return petProfileRepository.findAll(pageable).map(this::toListDto);
    }

    // ------------------------
    // 매핑(B 방식) — profileImageUrl 하나로 통일
    // ------------------------
    private PetProfileListResponseDto toListDto(PetProfile pet) {
        return PetProfileListResponseDto.builder()
                .petId(pet.getPetId())
                .name(pet.getName())
                .age(pet.getAge())                             // ✅ 추가
                .bodyType(pet.getBodyType())                   // ✅ 추가
                .breed(pet.getBreed())
                .typeName(pet.getPetType() != null ? pet.getPetType().getTypeName() : null)
                .profileImageUrl(pet.getProfileImageUrl()) // [핵심] 프론트는 이 키만 신뢰
                .build();
    }

    private PetProfileDetailResponseDto toDetailDto(PetProfile pet) {
        Integer petTypeId = pet.getPetType() != null ? pet.getPetType().getPetTypeId() : null;
        String typeName = pet.getPetType() != null ? pet.getPetType().getTypeName() : null;

        return PetProfileDetailResponseDto.builder()
                .petId(pet.getPetId())
                .ownerId(pet.getUser() != null ? pet.getUser().getUserId() : null)
                .name(pet.getName())
                .age(pet.getAge())
                .bodyType(pet.getBodyType())
                .breed(pet.getBreed())
                // [ADD] 누락된 필드 2개 추가
                .gender(pet.getGender())
                .neutered(Boolean.TRUE.equals(pet.getNeutered()))
                .petTypeId(petTypeId)
                .typeName(typeName)
                .profileImageUrl(pet.getProfileImageUrl()) // [핵심] 프론트는 이 키만 신뢰
                .content(pet.getContent())
                .build();
    }

    // ------------------------
    // [추가] 헬퍼: 파일명 검증/정규화
    // ------------------------
    /** null/빈 문자열이면 null, 경로 구분자 제거 후 "파일명"만 반환 */
    private String sanitizeStoredFileName(String raw) {
        if (raw == null) return null;
        String f = raw.trim();
        if (f.isEmpty()) return null;

        // 역슬래시→슬래시 통일 후 마지막 세그먼트만 사용
        f = f.replace('\\', '/');
        int idx = f.lastIndexOf('/');
        if (idx >= 0 && idx + 1 < f.length()) {
            f = f.substring(idx + 1);
        }

        // 경로 역참조 제거
        f = f.replace("..", "");

        return f.isEmpty() ? null : f;
    }

    private boolean isNotBlank(String s) {
        return s != null && !s.trim().isEmpty();
    }
}
