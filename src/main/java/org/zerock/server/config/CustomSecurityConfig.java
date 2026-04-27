// server/src/main/java/org/zerock/server/config/CustomSecurityConfig.java
package org.zerock.server.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.zerock.server.security.filter.JWTCheckFilter;
import org.zerock.server.security.handler.APILoginFailHandler;
import org.zerock.server.security.handler.APILoginSuccessHandler;
import org.zerock.server.security.handler.CustomAccessDeniedHandler;

import java.util.Arrays;

@Configuration
@Log4j2
@RequiredArgsConstructor
@EnableMethodSecurity
public class CustomSecurityConfig {

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring().requestMatchers(
                "/favicon.ico",
                "/api/pets/view/**",          // 펫 이미지 공개 뷰
                "/api/products/view/**",      // 상품 이미지 공개 뷰
                "/api/board/files/view/**"    // 게시판 파일 뷰
        );
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        log.info("----------security config (patched)---------------------------");

        // CORS
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));

        // JWT 방식
        http.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        http.csrf(csrf -> csrf.disable());

        // 로그인 엔드포인트 (리다이렉트는 EntryPoint에서 차단)
        http.formLogin(config -> {
            config.loginPage("/api/auth/login")
                    .usernameParameter("email")
                    .passwordParameter("password");
            config.successHandler(new APILoginSuccessHandler());
            config.failureHandler(new APILoginFailHandler());
        });

        // 접근 제어
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                .requestMatchers("/ws/**").permitAll()

                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/user/refresh").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/user/kakao").permitAll()

                .requestMatchers(HttpMethod.GET, "/api/product-categories").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products/categories").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products/*").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products/view/**").permitAll()

                .requestMatchers(HttpMethod.GET, "/api/board").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/board/list").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/board/*").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/board/files/view/**").permitAll()

                .requestMatchers(HttpMethod.GET, "/api/comment/board/*").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/comment/board/*/count").permitAll()

                .requestMatchers("/api/board/**").authenticated()

                .requestMatchers(HttpMethod.GET, "/api/notices").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/notices/").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/notices/list").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/notices/*").permitAll()

                // 그 외 notice는 인증 필요
                .requestMatchers("/api/notices/**").authenticated()

                .requestMatchers(HttpMethod.GET, "/api/pets").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/pets/*").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/pets/view/**").permitAll()

                .anyRequest().authenticated()
        );

        // JWT 필터
        http.addFilterBefore(new JWTCheckFilter(), UsernamePasswordAuthenticationFilter.class);

        // 401/403 핸들러: JSON으로 고정 (리다이렉트 금지)
        http.exceptionHandling(ex -> ex
                .authenticationEntryPoint((req, res, e) -> {
                    res.setStatus(401);
                    res.setContentType("application/json;charset=UTF-8");
                    res.getWriter().write("{\"error\":\"ERROR_ACCESS_TOKEN\"}");
                })
                .accessDeniedHandler(new CustomAccessDeniedHandler())
        );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("OPTIONS", "HEAD", "GET", "POST", "PUT", "DELETE"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
