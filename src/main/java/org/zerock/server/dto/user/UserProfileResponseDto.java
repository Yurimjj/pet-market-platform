package org.zerock.server.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.zerock.server.domain.user.UserInfo;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponseDto {

    private Long userId;
    private String email;
    private String nickname;
    private String phoneNumber;
    private String region;
    private boolean active;

    public static UserProfileResponseDto from(UserInfo user) {
        return UserProfileResponseDto.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .phoneNumber(user.getPhoneNumber())
                .region(user.getRegion())
                .active(user.isActive())
                .build();
    }
}
