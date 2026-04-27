package org.zerock.server.repository.user;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.zerock.server.domain.user.UserInfo;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UserInfoRepository extends JpaRepository<UserInfo, Long> {
    Optional<UserInfo> findByEmail(String email);

    Optional<UserInfo> findByNickname(String nickname);
    boolean existsByEmail(String email);
    boolean existsByNickname(String nickname);
    boolean existsByPhoneNumber(String phoneNumber);

    // 사용자 정보와 함께 userRoleList를 즉시 로딩하는 쿼리
    // email로 UserInfo를 조회하면서 userRoleList를 EntityGraph로 함께 로딩
    @EntityGraph(attributePaths = {"userRoleList"}) // UserInfo 엔티티의 userRoleList 필드명과 일치해야함
    @Query("select u from UserInfo u where u.email = :email") // UserInfo 엔티티의 별칭을 u로 사용
    Optional<UserInfo> getWithRoles(@Param("email") String email); // 반환 타입을 Optional<UserInfo>로 변경하는 것이 안전

    // [ADD] 일별 가입자 수 (UserInfo에 created_at 컬럼이 있을 때만 동작)
    //  - 기존 엔티티는 createdAt 필드가 없지만, DB에 created_at 컬럼이 있으면 네이티브로 안전 조회
    //  - 없으면 서비스에서 try-catch로 빈 리스트 반환
    @Query(value = """
        SELECT DATE(u.created_at) AS dt, COUNT(*) AS cnt
        FROM tb_user_info u
        WHERE u.created_at BETWEEN :start AND :end
        GROUP BY DATE(u.created_at)
        ORDER BY dt ASC
      """, nativeQuery = true)
    java.util.List<Object[]> countDailySignups(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}