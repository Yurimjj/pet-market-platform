package org.zerock.server.controller.notice;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.zerock.server.dto.user.UserInfoDTO;
import org.zerock.server.dto.notice.NoticeCreateDTO;
import org.zerock.server.dto.notice.NoticePageRequestDTO;
import org.zerock.server.dto.notice.NoticePageResponseDTO;
import org.zerock.server.dto.notice.NoticeResponseDTO;
import org.zerock.server.service.notice.NoticeService;
import org.zerock.server.util.JWTUtil;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
@Log4j2
public class NoticeController {
    private final NoticeService noticeService;

    // 공지사항 목록 조회
    // [CHG] 목록 API: Authorization 헤더에서 roleNames를 읽어 관리자 여부 판단
    @GetMapping("/list")
    public ResponseEntity<NoticePageResponseDTO<NoticeResponseDTO>> list(
            NoticePageRequestDTO requestDTO,
            @RequestHeader(value = "Authorization", required = false) String authorization // [ADD]
    ) {
        boolean includeHiddenForAdmin = false; // [ADD]

        try {
            if (authorization != null && authorization.startsWith("Bearer ")) {
                String token = authorization.substring(7);
                Map<String, Object> claims = JWTUtil.validateToken(token);
                Object rolesObj = claims.get("roleNames");
                if (rolesObj instanceof List<?> roles) {
                    // roleNames는 문자열 리스트: ["ADMIN", "MANAGER", ...]
                    includeHiddenForAdmin = roles.contains("ADMIN") || roles.contains("MANAGER");
                }
            }
        } catch (Exception ignore) {
            // 토큰이 없거나 깨져있으면 그냥 비관리자 플로우(공개글만)
        }

        log.info("공지사항 목록 조회: {}, includeHiddenForAdmin={}", requestDTO, includeHiddenForAdmin);

        // [CHG] 관리자면 숨김 포함 전체, 아니면 공개글만
        return ResponseEntity.ok(noticeService.getNoticeList(requestDTO, includeHiddenForAdmin));
    }

    // 특정 공지사항 조회
    @GetMapping("/{id}")
    public ResponseEntity<NoticeResponseDTO> getNotice(@PathVariable Long id) {
        log.info("특정 공지사항 조회: " + id);
        return ResponseEntity.ok(noticeService.getNotice(id));
    }

    // 공지사항 등록 Long 타입에서 UserInfoDTO로 변환
    @PreAuthorize("hasAnyRole('ROLE_MANAGER', 'ROLE_ADMIN')")
    @PostMapping("/register")
    public ResponseEntity<String> createNotice(
            @Valid @RequestBody NoticeCreateDTO request
    ) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserInfoDTO userInfo = (UserInfoDTO) authentication.getPrincipal();

        log.info("공지사항 등록 요청: " + request + ", 사용자 ID: " + userInfo.getUserId());

        noticeService.createNotice(request, userInfo.getUserId());

        return ResponseEntity.ok("공지사항 등록 완료");
    }

    // 공지사항 수정 Long 타입에서 UserInfoDTO로 변환
    @PreAuthorize("hasAnyRole('ROLE_MANAGER', 'ROLE_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<NoticeResponseDTO> updateNotice(
            @PathVariable Long id,
            @Valid @RequestBody NoticeCreateDTO request
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserInfoDTO userInfo = (UserInfoDTO) authentication.getPrincipal();

        log.info("공지사항 수정 요청 ID: " + id + ", 사용자 ID: " + userInfo.getUserId());
        NoticeResponseDTO updatedNotice = noticeService.updateNotice(
                id,
                request,
                userInfo.getUserId()
        );
        return ResponseEntity.ok(updatedNotice);
    }

    // 공지사항 삭제 Long 타입에서 UserInfoDTO로 변환
    @PreAuthorize("hasAnyRole('ROLE_MANAGER', 'ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotice(
            @PathVariable Long id
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserInfoDTO userInfo = (UserInfoDTO) authentication.getPrincipal();

        log.info("공지사항 삭제 요청 ID: " + id + ", 사용자 ID: " + userInfo.getUserId());
        noticeService.deleteNotice(id, userInfo.getUserId());

        return ResponseEntity.noContent().build();
    }
}