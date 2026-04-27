package org.zerock.server.service.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.zerock.server.dto.admin.DailySignUpDTO;
import org.zerock.server.repository.user.UserInfoRepository;

import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserInfoRepository userInfoRepository;

    public long getTotalUserCount() {
        return userInfoRepository.count();
    }

    public List<DailySignUpDTO> getDailySignUpCounts(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        try {
            List<Object[]> rows = userInfoRepository.countDailySignups(start, end);
            if (rows == null) return Collections.emptyList();

            return rows.stream()
                    .map(r -> {
                        // r[0] = java.sql.Date 또는 java.time.LocalDate, r[1] = Long/BigInteger
                        LocalDate d = (r[0] instanceof Date) ? ((Date) r[0]).toLocalDate() :
                                (r[0] instanceof LocalDate ? (LocalDate) r[0] : startDate);
                        long c = (r[1] instanceof Number) ? ((Number) r[1]).longValue() : 0L;
                        return new DailySignUpDTO(d, c);
                    })
                    .toList();
        } catch (DataAccessException | IllegalArgumentException e) {
            // created_at 컬럼이 없거나 기타 이슈면 안전히 빈 리스트 반환
            return Collections.emptyList();
        }
    }
}
