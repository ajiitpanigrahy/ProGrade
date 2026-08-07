package mac.prograde.api.controller;

import lombok.RequiredArgsConstructor;
import mac.prograde.api.dto.AdminDto;
import mac.prograde.api.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/metrics")
    public ResponseEntity<AdminDto.DashboardMetrics> getMetrics() {
        return ResponseEntity.ok(adminService.getKpiMetrics());
    }

    @GetMapping("/charts")
    public ResponseEntity<AdminDto.DashboardCharts> getCharts() {
        return ResponseEntity.ok(adminService.getChartData());
    }

    @GetMapping("/educators/pending")
    public ResponseEntity<List<AdminDto.PendingEducator>> getPendingEducators() {
        return ResponseEntity.ok(adminService.getPendingEducators());
    }

    @PutMapping("/educators/{id}/approve")
    public ResponseEntity<String> approveEducator(@PathVariable UUID id) {
        adminService.approveEducator(id);
        return ResponseEntity.ok("Educator approved successfully");
    }

    @DeleteMapping("/educators/{id}/reject")
    public ResponseEntity<String> rejectEducator(@PathVariable UUID id) {
        adminService.rejectEducator(id);
        return ResponseEntity.ok("Educator request rejected");
    }
}