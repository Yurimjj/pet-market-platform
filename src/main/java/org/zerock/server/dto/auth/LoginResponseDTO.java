package org.zerock.server.dto.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponseDTO {
    private String accessToken;
    private String refreshToken;
    private Long userId;
    private String email;
    private String password;
    private String nickname;
    private String phoneNumber;
    private String region;
    private String role;
}
