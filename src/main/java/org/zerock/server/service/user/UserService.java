package org.zerock.server.service.user;

import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.dto.user.UserInfoDTO;
import org.zerock.server.dto.user.UserModifyDTO;
import org.zerock.server.dto.user.UserProfileResponseDto;
import org.zerock.server.dto.user.UserProfileUpdateRequestDto;

public interface UserService {

    UserProfileResponseDto getMyProfile(Long userId);

    UserProfileResponseDto updateMyProfile(Long userId, UserProfileUpdateRequestDto request);

    void deactivate(Long userId);

    UserInfoDTO getKakaoUser(String accessToken);

    void modifyUser(UserModifyDTO userModifyDTO);

    default UserInfoDTO entityToDTO(UserInfo userInfo){
        UserInfoDTO dto = new UserInfoDTO(
                userInfo.getUserId(),
                userInfo.getEmail(),
                userInfo.getPassword(),
                userInfo.getNickname(),
                userInfo.getPhoneNumber(),
                userInfo.getRegion(),
                userInfo.getUserRoleList(), // List<UserRole> 넘김
                userInfo.isActive(),        // boolean isActive
                userInfo.isSocial()         // boolean social
        );

        return dto;
    }
}
