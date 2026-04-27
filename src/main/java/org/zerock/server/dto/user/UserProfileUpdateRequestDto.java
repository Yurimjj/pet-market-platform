package org.zerock.server.dto.user;

import lombok.Data;

@Data
public class UserProfileUpdateRequestDto {
    private String nickname;
    private String region;
    private String phoneNumber;

    private String currentPassword; // 비밀번호 변경시 현재 비번
    private String newPassword;     // 새 비번
}
