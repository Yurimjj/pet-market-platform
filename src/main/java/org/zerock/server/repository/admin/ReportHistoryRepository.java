package org.zerock.server.repository.admin;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.zerock.server.domain.admin.ReportHistory;

import java.util.List;

public interface ReportHistoryRepository extends JpaRepository<ReportHistory, Long> {

    List<ReportHistory> findAllByOrderByReportedAtDesc();

    List<ReportHistory> findByReportStatusOrderByReportedAtDesc(String reportStatus);

    @Query("select r.reportId from ReportHistory r where r.reportedUserId = :userId")
    List<Long> findIdsByReportedUserId(@Param("userId") Long userId);
}
