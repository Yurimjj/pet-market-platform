package org.zerock.server.controller.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.zerock.server.dto.user.UserInfoDTO;
import org.zerock.server.dto.user.UserModifyDTO;
import org.zerock.server.service.user.UserService;
import org.zerock.server.util.JWTUtil;

import java.util.Map;

@RestController
@Log4j2
@RequiredArgsConstructor
public class SocialController {

    private final UserService userService;

    @GetMapping("/api/user/kakao")
    public Map<String, Object> getMemberFromKakao(String accessToken){
        log.info("access Token");
        log.info(accessToken);

        // 카카오에 accessToken 을 전송하고 사용자 정보를 ㅂ다아온다.
        UserInfoDTO userInfoDTO = userService.getKakaoUser(accessToken);

        Map<String, Object> claims = userInfoDTO.getClaims();

        String jwtAccessToken = JWTUtil.generateToken(claims, 30);
        String jwtRefreshToken = JWTUtil.generateToken(claims, 60*24);

        claims.put("accessToken", jwtAccessToken);
        claims.put("refreshToken", jwtRefreshToken);

        // 리액트의 KakaoRedrictPage 에서 "/api/user/kakao" 를 요청 하였다.
        // 그래서 KakaoRedrictPage 로 사용자 정보 전송

        return claims;
    }

}
