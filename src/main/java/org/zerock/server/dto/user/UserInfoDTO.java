package org.zerock.server.dto.user;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.domain.user.UserRole;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Getter
@Setter
@ToString
public class UserInfoDTO extends User {

    private Long userId;
    private String email;
    private String password;
    private String nickname;
    private String phoneNumber;
    private String region;
    private boolean isActive;
    private boolean social;

    private List<UserRole> roleNames = new ArrayList<>();

    public UserInfoDTO(UserInfo userInfo) {
        super(userInfo.getEmail(),
                userInfo.getPassword(),
                userInfo.getUserRoleList().stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                        .collect(Collectors.toList()));

        this.userId = userInfo.getUserId();
        this.email = userInfo.getEmail();
        this.password = userInfo.getPassword();
        this.nickname = userInfo.getNickname();
        this.phoneNumber = userInfo.getPhoneNumber();
        this.region = userInfo.getRegion();
        this.isActive = userInfo.isActive();
        this.roleNames = userInfo.getUserRoleList();
        this.social = userInfo.isSocial();

    }

    public UserInfoDTO(Long userId, String email, String password,
                       String nickname, String phoneNumber,
                       String region, List<UserRole> roleNames, boolean isActive, boolean social){
        super(email, password, roleNames.stream().map(role ->
                new SimpleGrantedAuthority("ROLE_" + role.name())).collect(Collectors.toList()) );

        this.userId = userId;
        this.email = email;
        this.password = password;
        this.nickname = nickname;
        this.phoneNumber = phoneNumber;
        this.region = region;
        this.roleNames = roleNames;
        this.isActive = isActive;
        this.social = social;
    }

    public Map<String , Object> getClaims() {
        Map<String, Object> dataMap = new HashMap<>();

        dataMap.put("userId", userId);
        dataMap.put("email", email);
        // dataMap.put("password", password);
        dataMap.put("nickname", nickname);
        dataMap.put("phoneNumber", phoneNumber);
        dataMap.put("region", region);
        dataMap.put("isActive", isActive);
        dataMap.put("social", isSocial());
        dataMap.put("roleNames", roleNames.stream().map(Enum::name).collect(Collectors.toList()));

        return dataMap;
    }

}
