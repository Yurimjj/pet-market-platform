package org.zerock.server.dto.admin;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class WarningDTO {
    private Long logId;
    private Long reportId;
    private Long userId;            // 경고 대상 사용자 (reported_user_id)
    private String action;          // processing_action
    private String detail;          // action_detail
    private LocalDateTime actionDate;
}
