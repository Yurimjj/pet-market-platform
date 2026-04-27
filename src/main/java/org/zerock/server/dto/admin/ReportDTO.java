package org.zerock.server.dto.admin;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ReportDTO {
    private Long reportId;
    private String reportedType;
    private Long reportedEntityId;
    private Long reporterUserId;
    private Long reportedUserId;
    private String reportReason;
    private String reportDetail;
    private LocalDateTime reportedAt;
    private String reportStatus;
    private LocalDateTime processedAt;
    private String handledBy;
    private Long processorUserId;
}
