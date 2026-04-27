package org.zerock.server.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.log4j.Log4j2;

import javax.crypto.SecretKey;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.Map;

@Log4j2
public class JWTUtil {

    // 실제 서비스에서는 환경 변수 또는 별도 설정 파일을 통해 관리
    private static String key = "your-secret-key";

    public static String generateToken(Map<String , Object> valueMap, int min){

        SecretKey key = null;

        try{
            key = Keys.hmacShaKeyFor(JWTUtil.key.getBytes("UTF-8"));
        }catch (Exception e){
            throw new RuntimeException(e.getMessage());
        }

        String jwtStr = Jwts.builder()
                .setHeader(Map.of("typ", "JWT"))
                .setClaims(valueMap)
                //발행 시간
                .setIssuedAt(Date.from(ZonedDateTime.now().toInstant()))
                //만료 시간
                .setExpiration(Date.from(ZonedDateTime.now().plusMinutes(min).toInstant()))
                .signWith(key)
                .compact();

        return jwtStr;
    }


    // 토큰 검증
    public static Map<String, Object> validateToken(String token){

        Map<String, Object> claim = null;

        try{
            SecretKey key = Keys.hmacShaKeyFor(JWTUtil.key.getBytes("UTF-8"));

            claim = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)//파싱 및 검증, 실패 시 에러
                    .getBody();


        }catch (MalformedJwtException malformedJwtException){
            //토큰 형식이 잘못되었을 때
            throw new CustomJWTException("MalFormed");
        }catch (ExpiredJwtException expiredJwtException){
            //토큰의 유효기간이 자났을때
            throw new CustomJWTException("Expired");
        }catch (InvalidClaimException invalidClaimException){
            //claim 의 값이 틀렸거나 유효하지 않을때
            throw new CustomJWTException("Invalid");
        }catch (JwtException jwtException){
            //JWT 처리중 발생하는 모든 예외 처리의 최상위 클래스
            throw new CustomJWTException("JWTError");
        }catch (Exception e){
            throw new CustomJWTException("Error");
        }

        return claim;
    }
}
