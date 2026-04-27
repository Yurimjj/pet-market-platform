package org.zerock.server.controller.pet;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.ModelAttribute; // DTO 바인딩용
import org.zerock.server.dto.pet.*;
import org.zerock.server.dto.user.UserInfoDTO;
import org.zerock.server.service.pet.PetProfileService;
import org.zerock.server.util.CustomFileUtil;

import java.util.Collections;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/pets")
public class PetController {

    private final PetProfileService petProfileService;
    private final CustomFileUtil customFileUtil;

    /** 업로드 파일 보기 (product/board와 동일 스타일 유지) */
    @GetMapping("/view/{fileName:.+}")
    public ResponseEntity<Resource> viewFile(@PathVariable String fileName) {
        return customFileUtil.getFile(fileName);
    }

    /**
     * 등록
     * - ✅ @RequestParam(image) 제거
     * - ✅ @ModelAttribute DTO 하나로 텍스트 + 파일( image ) 동시 바인딩
     * - 컨트롤러에서 파일을 먼저 저장하고, 저장된 파일명을 DTO.uploadFileName에 주입한 뒤 서비스에 전달
     */
    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Long> registerPet(
            @ModelAttribute PetProfileRegisterRequestDto dto,   // DTO 내부에 MultipartFile image 포함
            @AuthenticationPrincipal UserInfoDTO user
    ) {
        // DTO에 들어온 파일이 있으면 컨트롤러에서 먼저 저장
        String savedFileName = null;
        if (dto.getImage() != null && !dto.getImage().isEmpty()) {
            savedFileName = customFileUtil
                    .saveFiles(Collections.singletonList(dto.getImage()))
                    .stream().findFirst().orElse(null);
        }
        // 서비스가 파일명을 쓰도록 DTO에 주입
        dto.setUploadFileName(savedFileName);

        Long petId = petProfileService.registerPet(
                dto,
                user != null ? user.getUserId() : null // 작성자(로그인 사용자)
        );
        return ResponseEntity.ok(petId);
    }

    /** 상세 조회 (기존 시그니처 유지) */
    @GetMapping("/{petId}")
    public ResponseEntity<PetProfileDetailResponseDto> getDetail(
            @PathVariable Long petId,
            @AuthenticationPrincipal UserInfoDTO user
    ) {
        return ResponseEntity.ok(petProfileService.getPetDetail(petId, user));
    }

    /**
     * 수정
     * - ✅ @RequestParam(newImage) 제거
     * - ✅ @ModelAttribute PetProfileUpdateRequestDto에 image를 넣어 받음
     * - 새 이미지가 들어오면 저장 → DTO.uploadFileName 세팅 → 서비스 갱신
     * - 파일 교체 시, 이전 파일 물리 삭제
     */
    @PutMapping(
            value = "/{petId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Void> updatePet(
            @PathVariable Long petId,
            @ModelAttribute PetProfileUpdateRequestDto dto, // DTO 내부에 MultipartFile image 포함(선택)
            @AuthenticationPrincipal UserInfoDTO user
    ) {
        // 기존 파일명 확보(교체 여부 판단용)
        String oldFileName = null;
        PetProfileDetailResponseDto before = petProfileService.getPetDetail(petId, user);
        if (before != null) {
            oldFileName = before.getProfileImageUrl();
        }

        // 새 파일이 있으면 저장 후 DTO에 결과 파일명 세팅
        String newFileName = null;
        if (dto.getImage() != null && !dto.getImage().isEmpty()) {
            newFileName = customFileUtil
                    .saveFiles(Collections.singletonList(dto.getImage()))
                    .stream().findFirst().orElse(null);
            dto.setUploadFileName(newFileName);
        }

        // 서비스에 수정 위임
        petProfileService.updatePet(
                petId,
                dto,
                user != null ? user.getUserId() : null
        );

        // 파일 교체가 일어났다면 이전 파일 물리 삭제
        if (newFileName != null && oldFileName != null && !newFileName.equals(oldFileName)) {
            customFileUtil.deleteFiles(Collections.singletonList(oldFileName));
        }
        return ResponseEntity.ok().build();
    }

    /** 삭제 (기본 물리삭제; 소프트삭제는 ServiceImpl에서 전략 변경) */
    @DeleteMapping("/{petId}")
    public ResponseEntity<Void> deletePet(
            @PathVariable Long petId,
            @AuthenticationPrincipal UserInfoDTO user
    ) {
        petProfileService.deletePet(petId, user != null ? user.getUserId() : null);
        return ResponseEntity.ok().build();
    }

    /**
     * 목록
     * - ✅ @RequestParam(개별 필터) 제거
     * - ✅ @ModelAttribute PetListRequestDto로 필터를 한 번에 바인딩 (게시판 PageRequestDTO 패턴과 동일)
     * - Pageable(0-based)는 기존과 동일하게 사용
     */
    @GetMapping
    public ResponseEntity<Page<PetProfileListResponseDto>> list(
            Pageable pageable,
            @ModelAttribute PetListRequestDto filter // petTypeId / ownerId / keyword
    ) {
        return ResponseEntity.ok(
                petProfileService.getPetList(
                        pageable,
                        filter.getPetTypeId(),
                        filter.getOwnerId(),
                        filter.getKeyword()
                )
        );
    }
}
