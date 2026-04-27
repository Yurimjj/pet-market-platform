package org.zerock.server.controller.admin;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.zerock.server.dto.admin.WarningDTO;
import org.zerock.server.service.admin.WarningService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class WarningController {

    private final WarningService warningService;

    // GET /api/admin/warnings/{userId}
    @GetMapping("/warnings/{userId}")
    public ResponseEntity<List<WarningDTO>> list(@PathVariable Long userId) {
        return ResponseEntity.ok(warningService.listByUser(userId));
    }

    // POST /api/admin/warnings  (reportId 기반 경고 등록)
    @PostMapping("/warnings")
    public ResponseEntity<?> create(@RequestBody CreateReq req) {
        Long id = warningService.createWarning(req.reportId, req.adminUserId, req.detail);
        return ResponseEntity.ok(Map.of("logId", id));
    }

    @Data
    public static class CreateReq {
        private Long reportId;     // 어떤 신고에 대한 경고인지
        private Long adminUserId;  // 관리자 ID
        private String detail;     // 사유/메모
    }
}
