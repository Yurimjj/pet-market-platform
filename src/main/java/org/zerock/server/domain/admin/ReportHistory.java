package org.zerock.server.domain.admin;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tb_report_history")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ReportHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long reportId;

    @Column(name = "reported_type", nullable = false, length = 32)
    private String reportedType;         // POST / COMMENT / PRODUCT / USER ...

    @Column(name = "reported_entity_id")
    private Long reportedEntityId;       // 대상 개체 ID

    @Column(name = "reporter_user_id")
    private Long reporterUserId;         // 신고자

    @Column(name = "reported_user_id")
    private Long reportedUserId;         // 신고대상 사용자

    @Column(name = "report_reason", length = 255)
    private String reportReason;

    @Lob
    @Column(name = "report_detail")
    private String reportDetail;

    @Column(name = "reported_at")
    private LocalDateTime reportedAt;

    @Column(name = "report_status", length = 16)
    private String reportStatus;         // PENDING / RESOLVED ...

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "handled_by", length = 64)
    private String handledBy;            // 처리자 이름(선택)

    @Column(name = "processor_user_id")
    private Long processorUserId;        // 처리자 사용자ID(선택)
}
