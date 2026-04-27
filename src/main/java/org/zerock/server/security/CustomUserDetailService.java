package org.zerock.server.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.dto.user.UserInfoDTO;
import org.zerock.server.repository.user.UserInfoRepository;

import java.util.Optional;

@Service
@Log4j2
@RequiredArgsConstructor
public class CustomUserDetailService implements UserDetailsService {

    private final UserInfoRepository userInfoRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        log.info("===================loadUserByUsername===================");

        // 사용자 정보 조회
        Optional<UserInfo> userInfoOptional = userInfoRepository.getWithRoles(email);

        // 2. Optional 안에 UserInfo 객체가 없으면 UsernameNotFoundException을 발생

        UserInfo userInfo = userInfoOptional.orElseThrow(() ->
                new UsernameNotFoundException("해당 이메일의 사용자를 찾을 수 없습니다: " + email));


        // 3. 조회된 UserInfo 엔티티 객체를 이용하여 UserInfoDTO 객체를 생성하여 반환
        UserInfoDTO userInfoDTO = new UserInfoDTO(userInfo);


        log.info("UserInfoDTO password: " + userInfoDTO.getPassword());
        log.info("로드된 사용자 정보 DTO: " + userInfoDTO);

        return userInfoDTO;
    }
}
