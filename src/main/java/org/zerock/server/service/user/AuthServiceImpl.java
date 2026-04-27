package org.zerock.server.service.user;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.domain.user.UserRole;
import org.zerock.server.dto.auth.ModifyRequestDTO;
import org.zerock.server.dto.auth.SignupRequestDTO;
import org.zerock.server.dto.auth.WithdrawalRequestDTO;
import org.zerock.server.repository.user.UserInfoRepository;
import org.zerock.server.service.user.AuthService;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserInfoRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 회원가입
    @Override
    public void signup(SignupRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException("이미 존재하는 이메일입니다.");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        UserInfo user = UserInfo.builder()
                .email(request.getEmail())
                .password(encodedPassword)
                .username(request.getUsername())
                .nickname(request.getNickname())
                .phoneNumber(request.getPhoneNumber())
                .region(request.getRegion())
                .isActive(true)
                .build();

        user.getUserRoleList().add(UserRole.USER);

        userRepository.save(user);
    }

    // 이메일 중복 여부 확인(사용 가능시 true)
    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(email);
    }

    // 닉네임 중복 여부 확인(사용 가능시 true)
    public boolean isNicknameAvailable(String nickname) {
        return !userRepository.existsByNickname(nickname);
    }

    // 휴대폰 중복 여부 확인(사용 가능시 true)
    public boolean isPhoneNumberAvailable(String phoneNumber) {
        return !userRepository.existsByPhoneNumber(phoneNumber);
    }

    // 사용자가 입력한 비밀번호가 기존 비밀번호와 일치하는지
    @Override
    public boolean validatePassword(String email, String password) {
        UserInfo user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return passwordEncoder.matches(password, user.getPassword());
    }

    // 특정 사용자의 정보를 조회하여 수정 페이지에 표시할 DTO 형태 반환
    @Override
    @Transactional(readOnly = true)
    public ModifyRequestDTO getUserInfo(String email) {
        UserInfo user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return ModifyRequestDTO.builder()
                .nickname(user.getNickname())
                .phoneNumber(user.getPhoneNumber())
                .region(user.getRegion())
                .build();
    }

    // 회원정보 수정
   @Override
   @Transactional
    public void modifyUserInfo(ModifyRequestDTO modifyRequestDTO){
       Optional<UserInfo> result = userRepository.findById(modifyRequestDTO.getUserId());

       UserInfo userInfo = result.orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

       if (modifyRequestDTO.getPassword() != null && !modifyRequestDTO.getPassword().isBlank()) {
           userInfo.setPassword(passwordEncoder.encode(modifyRequestDTO.getPassword()));

       }

       userInfo.setPhoneNumber(modifyRequestDTO.getPhoneNumber());
       userInfo.setNickname(modifyRequestDTO.getNickname());
       userInfo.setRegion(modifyRequestDTO.getRegion());

       // ✅ 소셜 계정이면 일반 전환
       if (userInfo.isSocial()) {
           userInfo.setSocial(false);
       }

       userRepository.save(userInfo);
   }

   // 회원 탈퇴
    @Override
    @Transactional
    public void withdraw(WithdrawalRequestDTO withdrawalRequestDTO) {
        Optional<UserInfo> result = userRepository.findById(withdrawalRequestDTO.getUserId());

        UserInfo userInfo = result.orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (!passwordEncoder.matches(withdrawalRequestDTO.getPassword(), userInfo.getPassword())) {
            throw new IllegalStateException("비밀번호가 일치하지 않습니다.");
        }

        userRepository.delete(userInfo);
    }

}
