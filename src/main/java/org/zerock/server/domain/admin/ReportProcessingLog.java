package org.zerock.server.domain.admin;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tb_report_processing_log")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ReportProcessingLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long logId;

    @Column(name = "report_id")
    private Long reportId;             // FK -> tb_report_history.report_id

    @Column(name = "actor_id")
    private Long actorId;              // 행위자(관리자)

    @Column(name = "processor_user_id")
    private Long processorUserId;      // (스키마에 있어 보유만, 실제는 actorId 사용)

    @Column(name = "processing_action", length = 32)
    private String processingAction;   // WARNING_ISSUED / RESOLVED / DISMISSED / SUSPENDED ...

    @Lob
    @Column(name = "action_detail")
    private String actionDetail;       // 사유/메모

    @Column(name = "action_date")
    private LocalDateTime actionDate;
}
