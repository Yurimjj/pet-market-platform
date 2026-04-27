package org.zerock.server.controller.admin;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.zerock.server.dto.admin.ReportDTO;
import org.zerock.server.service.admin.ReportHistoryService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class ModerationReadController {

    private final ReportHistoryService reportService;

    // 목록: /api/admin/reports?status=PENDING
    @GetMapping("/reports")
    public ResponseEntity<List<ReportDTO>> listReports(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(reportService.list(status));
    }

    // 상세
    @GetMapping("/reports/{id}")
    public ResponseEntity<ReportDTO> getReport(@PathVariable("id") Long id) {
        var dto = reportService.get(id);
        return dto == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(dto);
    }

    // 처리(RESOLVED 로그 남김)
    @PostMapping("/reports/{id}/resolve")
    public ResponseEntity<?> resolve(@PathVariable("id") Long id, @RequestBody(required = false) ResolveBody body) {
        Long adminId = body != null ? body.adminUserId : null;
        String adminName = body != null ? body.adminName : null;
        String memo = body != null ? body.memo : null;
        reportService.resolve(id, adminId, adminName, memo);
        return ResponseEntity.ok(Map.of("result","ok"));
    }

    // 임의 액션 추가(경고, 반려 등)
    @PostMapping("/reports/{id}/actions")
    public ResponseEntity<?> addAction(@PathVariable("id") Long id, @RequestBody ActionBody body) {
        reportService.addAction(id, body.adminUserId, body.action, body.detail);
        return ResponseEntity.ok(Map.of("result","ok"));
    }

    @Data
    public static class ResolveBody { Long adminUserId; String adminName; String memo; }

    @Data
    public static class ActionBody { Long adminUserId; String action; String detail; }
}
