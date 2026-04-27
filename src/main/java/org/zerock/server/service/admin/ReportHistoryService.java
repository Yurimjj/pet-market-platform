package org.zerock.server.service.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.server.domain.admin.ReportHistory;
import org.zerock.server.domain.admin.ReportProcessingLog;
import org.zerock.server.dto.admin.ReportDTO;
import org.zerock.server.repository.admin.ReportHistoryRepository;
import org.zerock.server.repository.admin.ReportProcessingLogRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportHistoryService {

    private final ReportHistoryRepository reportRepo;
    private final ReportProcessingLogRepository logRepo;

    public List<ReportDTO> list(String status) {
        var list = (status == null || status.isBlank())
                ? reportRepo.findAllByOrderByReportedAtDesc()
                : reportRepo.findByReportStatusOrderByReportedAtDesc(status);
        return list.stream().map(this::toDTO).toList();
    }

    public ReportDTO get(Long reportId) {
        return reportRepo.findById(reportId).map(this::toDTO).orElse(null);
    }

    public List<ReportProcessingLog> logs(Long reportId) {
        return logRepo.findByReportIdOrderByActionDateDesc(reportId);
    }

    @Transactional
    public void resolve(Long reportId, Long adminUserId, String adminName, String memo) {
        var r = reportRepo.findById(reportId).orElseThrow();
        r.setReportStatus("RESOLVED");
        r.setProcessedAt(LocalDateTime.now());
        r.setProcessorUserId(adminUserId);
        r.setHandledBy(adminName);
        reportRepo.save(r);

        // 처리 로그 적재
        var log = ReportProcessingLog.builder()
                .reportId(reportId)
                .actorId(adminUserId)
                .processingAction("RESOLVED")
                .actionDetail(memo)
                .actionDate(LocalDateTime.now())
                .build();
        logRepo.save(log);
    }

    @Transactional
    public void addAction(Long reportId, Long adminUserId, String action, String detail) {
        var log = ReportProcessingLog.builder()
                .reportId(reportId)
                .actorId(adminUserId)
                .processingAction(action)
                .actionDetail(detail)
                .actionDate(LocalDateTime.now())
                .build();
        logRepo.save(log);
    }

    private ReportDTO toDTO(ReportHistory r) {
        return ReportDTO.builder()
                .reportId(r.getReportId())
                .reportedType(r.getReportedType())
                .reportedEntityId(r.getReportedEntityId())
                .reporterUserId(r.getReporterUserId())
                .reportedUserId(r.getReportedUserId())
                .reportReason(r.getReportReason())
                .reportDetail(r.getReportDetail())
                .reportedAt(r.getReportedAt())
                .reportStatus(r.getReportStatus())
                .processedAt(r.getProcessedAt())
                .handledBy(r.getHandledBy())
                .processorUserId(r.getProcessorUserId())
                .build();
    }
}
