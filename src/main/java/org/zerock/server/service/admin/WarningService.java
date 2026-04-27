package org.zerock.server.service.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.server.domain.admin.ReportProcessingLog;
import org.zerock.server.dto.admin.WarningDTO;
import org.zerock.server.repository.admin.ReportHistoryRepository;
import org.zerock.server.repository.admin.ReportProcessingLogRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WarningService {

    private final ReportHistoryRepository reportRepo;
    private final ReportProcessingLogRepository logRepo;

    // 경고성 액션 목록(필요시 추가)
    private static final List<String> WARNING_ACTIONS = List.of("WARN", "WARNING", "WARNING_ISSUED");

    /** 특정 사용자에 대한 경고 로그 목록 */
    public List<WarningDTO> listByUser(Long userId) {
        var reportIds = reportRepo.findIdsByReportedUserId(userId);
        if (reportIds == null || reportIds.isEmpty()) return List.of();
        var logs = logRepo.findByReportIdInAndProcessingActionInOrderByActionDateDesc(reportIds, WARNING_ACTIONS);
        return logs.stream().map(l -> WarningDTO.builder()
                        .logId(l.getLogId())
                        .reportId(l.getReportId())
                        .userId(userId)
                        .action(l.getProcessingAction())
                        .detail(l.getActionDetail())
                        .actionDate(l.getActionDate())
                        .build())
                .toList();
    }

    /** 경고 등록: 특정 신고(reportId)에 경고 액션을 남김 */
    @Transactional
    public Long createWarning(Long reportId, Long adminUserId, String detail) {
        var log = ReportProcessingLog.builder()
                .reportId(reportId)
                .actorId(adminUserId)
                .processingAction("WARNING_ISSUED")
                .actionDetail(detail)
                .actionDate(LocalDateTime.now())
                .build();
        return logRepo.save(log).getLogId();
    }
}
