package org.zerock.server.controller.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.zerock.server.dto.user.UserInfoDTO;
import org.zerock.server.dto.user.UserProfileResponseDto;
import org.zerock.server.dto.user.UserProfileUpdateRequestDto;
import org.zerock.server.service.user.UserService;

@Log4j2
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserService userService;

    /** 내 프로필 조회 */
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponseDto> me(@AuthenticationPrincipal UserInfoDTO principal) {
        Long userId = principal.getUserId();
        return ResponseEntity.ok(userService.getMyProfile(userId));
    }

    /** 내 프로필 수정 */
    @PutMapping("/me")
    public ResponseEntity<UserProfileResponseDto> updateMe(@AuthenticationPrincipal UserInfoDTO principal,
                                                           @RequestBody UserProfileUpdateRequestDto request) {
        Long userId = principal.getUserId();
        return ResponseEntity.ok(userService.updateMyProfile(userId, request));
    }

    /** 회원 탈퇴(비활성화) */
    @DeleteMapping("/me")
    public ResponseEntity<Void> deactivate(@AuthenticationPrincipal UserInfoDTO principal) {
        userService.deactivate(principal.getUserId());
        return ResponseEntity.noContent().build();
    }
}
