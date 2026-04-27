package org.zerock.server.service.user;

import org.zerock.server.dto.auth.ModifyRequestDTO;
import org.zerock.server.dto.auth.SignupRequestDTO;
import org.zerock.server.dto.auth.WithdrawalRequestDTO;

public interface AuthService {
    void signup(SignupRequestDTO request);

    boolean isEmailAvailable(String email);
    boolean isNicknameAvailable(String nickname);
    boolean isPhoneNumberAvailable(String phoneNumber);
    boolean validatePassword(String email, String password);

    void modifyUserInfo(ModifyRequestDTO modifyRequestDTO);
    void withdraw(WithdrawalRequestDTO withdrawalRequestDTO);
    ModifyRequestDTO getUserInfo(String email);
}
