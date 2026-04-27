package org.zerock.server.repository.admin;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.server.domain.admin.ReportProcessingLog;

import java.util.List;

public interface ReportProcessingLogRepository extends JpaRepository<ReportProcessingLog, Long> {

    List<ReportProcessingLog> findByReportIdOrderByActionDateDesc(Long reportId);

    List<ReportProcessingLog> findByReportIdInAndProcessingActionInOrderByActionDateDesc(
            List<Long> reportIds, List<String> actions
    );
}
