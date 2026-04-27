package org.zerock.server.controller.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.zerock.server.dto.user.UserInfoDTO;
import org.zerock.server.dto.auth.ModifyRequestDTO;
import org.zerock.server.dto.auth.SignupRequestDTO;
import org.zerock.server.dto.auth.WithdrawalRequestDTO;
import org.zerock.server.service.user.AuthService;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Log4j2
public class AuthController {
    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@Valid @RequestBody SignupRequestDTO request) {
        try {
            authService.signup(request);
            return ResponseEntity.status(HttpStatus.CREATED).body("회원가입이 성공적으로 완료되었습니다.");
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // 이메일 중복 확인 API
    @PostMapping("/check-email")
    public Map<String, Boolean> checkEmail(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        boolean isAvailable = authService.isEmailAvailable(email);
        return Map.of("isAvailable", isAvailable);
    }

    // 닉네임 중복 확인 API
    @PostMapping("/check-nickname")
    public Map<String, Boolean> checkNickname(@RequestBody Map<String, String> payload) {
        String nickname = payload.get("nickname");
        boolean isAvailable = authService.isNicknameAvailable(nickname);
        return Map.of("isAvailable", isAvailable);
    }

    // 휴대폰 번호 중복 확인 API
    @PostMapping("/check-phone-number")
    public Map<String, Boolean> checkPhoneNumber(@RequestBody Map<String, String> payload) {
        String phoneNumber = payload.get("phoneNumber");
        boolean isAvailable = authService.isPhoneNumberAvailable(phoneNumber);
        return Map.of("isAvailable", isAvailable);
    }

    // 비밀번호 유효성 검사 API
    @PostMapping("/validate-password")
    public Map<String, Boolean> validatePassword(
            @AuthenticationPrincipal String email, // 로그인된 사용자의 이메일 주입
            @RequestBody WithdrawalRequestDTO request) {
        boolean isValid = authService.validatePassword(email, request.getPassword());
        return Map.of("isValid", isValid);
    }

    // 새로운 사용자 정보 조회 API
    @GetMapping("/info")
    public ResponseEntity<ModifyRequestDTO> getUserInfo(@AuthenticationPrincipal UserInfoDTO userInfoDTO) {
        ModifyRequestDTO userInfo = authService.getUserInfo(userInfoDTO.getEmail());
        return ResponseEntity.ok(userInfo);
    }

    // 회원 정보 수정
    @PutMapping("/modify")
    public Map<String, String> modify(@RequestBody ModifyRequestDTO modifyRequestDTO) {
        log.info("User modify : " + modifyRequestDTO);
        authService.modifyUserInfo(modifyRequestDTO);
        return Map.of("result", "modify");
    }

    // 회원 탈퇴
    @DeleteMapping ("/withdrawal")
    public Map<String, String> withdrawal(@RequestBody WithdrawalRequestDTO withdrawalRequestDTO) {
        log.info("User withdrawal : " + withdrawalRequestDTO);
        authService.withdraw(withdrawalRequestDTO);
        return Map.of("result", "withdrawal");
    }

}