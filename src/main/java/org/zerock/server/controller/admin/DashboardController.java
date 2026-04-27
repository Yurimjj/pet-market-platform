package org.zerock.server.controller.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.zerock.server.dto.admin.DailySignUpDTO;
import org.zerock.server.service.admin.DashboardService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/total-users")
    public ResponseEntity<Long> getTotalUserCount() {
        return ResponseEntity.ok(dashboardService.getTotalUserCount());
    }

    @GetMapping("/daily-signups")
    public ResponseEntity<List<DailySignUpDTO>> getDailySignUps(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(dashboardService.getDailySignUpCounts(startDate, endDate));
    }
}
