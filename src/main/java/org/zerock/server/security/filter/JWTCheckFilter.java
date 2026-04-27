package org.zerock.server.security.filter;

import com.google.gson.Gson;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import org.zerock.server.domain.user.UserRole;
import org.zerock.server.dto.user.UserInfoDTO;
import org.zerock.server.util.JWTUtil;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Log4j2
public class JWTCheckFilter extends OncePerRequestFilter {

    /**
     * shouldNotFilter = true 이면 이 필터를 "건너뜀"
     * - 공개 경로(permitAll)와 CORS preflight, 인증/회원가입 경로는 필터 제외
     * - 여기서 제외하지 않으면, SecurityConfig에서 permitAll이어도 JWT가 없다는 이유로 401이 날 수 있음
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {

        // 요청 정보
        final String path = request.getRequestURI();
        final String method = request.getMethod();

        // 0) CORS Preflight(OPTIONS)는 항상 통과
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }

        log.info("JWTCheckFilter shouldNotFilter? method={}, uri={}", method, path);

        // 1) 인증/회원가입/리프레시 관련은 항상 통과
        if (path.startsWith("/api/auth/")) return true;
        if (path.startsWith("/api/user/refresh")) return true; // ★ 추가: refresh만 명시적으로 스킵
        if (path.startsWith("/api/user/kakao")) return true; // ✅ 카카오 교환 API는 공개로 스킵

        // 2) 파일 뷰(게시판 첨부 이미지)는 공개로 통과
        if ("GET".equalsIgnoreCase(method) && path.startsWith("/api/board/files/view/")) {
            return true;
        }
        // 2-1) 파일 뷰(상품 이미지) 공개  ★★ 추가됨
        if ("GET".equalsIgnoreCase(method) && path.startsWith("/api/products/view/")) {
            return true;
        }

        // 3) ======= 공개 GET 화이트리스트 =======
        //    SecurityConfig의 permitAll 규칙과 반드시 일치해야 함
        if (HttpMethod.GET.matches(method)) {

            // (A) 카테고리/상품 목록 - 공개
            if ("/api/product-categories".equals(path)) return true;
            if ("/api/products/categories".equals(path)) return true;
            if ("/api/products".equals(path)) return true;
            if (path.matches("^/api/products/?$")) return true; // ★ 추가: 트레일링 슬래시 허용
            // 단건 조회: 토큰이 있으면 검사해서 SecurityContext 세팅, 없으면 공개로 통과
            if (path.matches("^/api/products/\\d+$")) {
                String ah = request.getHeader("Authorization");
                boolean hasBearer = (ah != null && ah.startsWith("Bearer "));
                return !hasBearer; // 토큰 없으면 스킵(true), 있으면 필터 적용(false)
            }
            // hasBearer를 사용한 이유
            // 기존 코드: if (path.matches("^/api/products/\\d+$")) return true;
            // 이렇게 하면: 토큰이 있어도 무시됨 → SecurityContext에 사용자 정보가 안 들어감 → 항상 isLiked=false
            // 토큰이 없으면 → 공개 조회니까 그냥 통과 (liked는 false)
            // 토큰이 있으면 → JWT 필터가 동작해서 SecurityContext에 사용자 세팅 → liked 계산 가능

            // (B) 게시판 공개 조회 - 공개
            if ("/api/board".equals(path)) return true;          // 목록
            if ("/api/board/list".equals(path)) return true;     // 목록
            if (path.matches("^/api/board/\\d+$")) return true;  // 단일 조회: /api/board/{postId}

            // (C) 댓글 공개 조회 - 공개
            if (path.matches("^/api/comment/board/\\d+$")) return true;
            if (path.matches("^/api/comment/board/\\d+/count$")) return true;

            // (D) ★ NOTICE 공개 GET - 공개
            //    - 목록/리스트/상세(숫자 id)만 공개, 그 외 /api/notices/** 는 인증 필요
            if ("/api/notices".equals(path)) return true;      // /api/notices
            if ("/api/notices/".equals(path)) return true;     // /api/notices/
            if ("/api/notices/list".equals(path)) return true; // /api/notices/list
            if (path.matches("^/api/notices/\\d+$")) return true; // /api/notices/{id}

            // (E) ★ 펫 프로필 공개 GET - 공개
            if ("/api/pets".equals(path)) return true;       // /api/pets
            if ("/api/pets/".equals(path)) return true;      // /api/pets/
            if (path.matches("^/api/pets/\\d+$")) return true;    // /api/pets/{petId}
            if (path.startsWith("/api/pets/view/")) return true;  // 파일 뷰 경로가 있다면
        }

        // SockJS 핸드셰이크/전송 엔드포인트는 JWT 검사 제외
        if (path.startsWith("/ws")) {
            return true;
        }

        // 그 외는 필터 적용(= JWT 검사 대상)
        return false;
    }


    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        log.info("------- JWTCheckFilter.doFilterInternal() -------");

        String authHeaderStr = request.getHeader("Authorization");

        try {
            if (authHeaderStr == null || !authHeaderStr.startsWith("Bearer ")) {
                writeUnauthorizedJson(response, "ERROR_ACCESS_TOKEN");
                return;
            }

            String accessToken = authHeaderStr.substring(7);

            Map<String, Object> claims = JWTUtil.validateToken(accessToken);
            log.info("JWT claims: {}", claims);

            // ====== 클레임 파싱 (타입 안전하게) ======
            Long userId = Long.parseLong(String.valueOf(claims.get("userId")));
            String email = String.valueOf(claims.get("email"));
            String password = String.valueOf(claims.get("password")); // 운영에선 비번을 JWT에 넣지 않는 걸 권장
            String nickname = String.valueOf(claims.get("nickname"));
            String phoneNumber = String.valueOf(claims.get("phoneNumber"));
            String region = String.valueOf(claims.get("region"));
            boolean isActive = Boolean.parseBoolean(String.valueOf(claims.get("isActive")));
            boolean social = Boolean.parseBoolean(String.valueOf(claims.get("social")));

            List<UserRole> roleNames = List.of();
            Object rolesObj = claims.get("roleNames");
            if (rolesObj instanceof List<?> anyList) {
                roleNames = anyList.stream()
                        .map(String::valueOf)
                        .map(UserRole::valueOf)
                        .collect(Collectors.toList());
            }

            UserInfoDTO userInfoDTO = new UserInfoDTO(
                    userId, email, password, nickname, phoneNumber, region, roleNames, isActive, social
            );

            log.info("Authenticated user: {}", userInfoDTO);

            // 5) 스프링 시큐리티 컨텍스트에 인증 정보 저장
            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(
                            userInfoDTO, password, userInfoDTO.getAuthorities()
                    );
            SecurityContextHolder.getContext().setAuthentication(authenticationToken);

            filterChain.doFilter(request, response);

        } catch (Exception e) {
            log.error("JWT Check Error: {}", e.getMessage());
            writeUnauthorizedJson(response, "ERROR_ACCESS_TOKEN");
        }
    }

    private void writeUnauthorizedJson(HttpServletResponse response, String code) throws IOException {
        Gson gson = new Gson();
        String msg = gson.toJson(Map.of("error", code));
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json; charset=UTF-8");
        try (PrintWriter pw = response.getWriter()) {
            pw.println(msg);
        }
    }
}
