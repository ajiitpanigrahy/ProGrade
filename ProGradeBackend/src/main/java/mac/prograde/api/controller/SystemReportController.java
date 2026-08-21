package mac.prograde.api.controller;

import mac.prograde.api.dto.ReportRequestDTO;
import mac.prograde.api.service.SystemReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/api/v1")
public class SystemReportController {

    @Autowired
    private SystemReportService reportService;

    // Accessible by Students and Educators
    @PostMapping("/reports")
    @PreAuthorize("hasAnyRole('STUDENT', 'EDUCATOR', 'ADMIN')")
    public ResponseEntity<?> submitReport(@RequestBody ReportRequestDTO payload, Authentication auth) {
        return ResponseEntity.ok(reportService.submitReport(payload, auth));
    }

    // Admin Only Endpoints
    @GetMapping("/admin/reports")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }
    
 // 🌟 ADD THIS: Endpoint for students/educators to track their reports
    @GetMapping("/reports/my")
    @PreAuthorize("hasAnyRole('STUDENT', 'EDUCATOR', 'ADMIN')")
    public ResponseEntity<?> getMyReports(Authentication auth) {
        return ResponseEntity.ok(reportService.getMyReports(auth.getName()));
    }

    // 🌟 UPDATE THIS: Admin endpoint payload now accepts 'notes'
    @PutMapping("/admin/reports/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateReportStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        reportService.updateReportStatus(id, payload.get("status"), payload.get("notes"));
        return ResponseEntity.ok(Map.of("message", "Status updated successfully"));
    }
    
 // 🌟 ADD THIS: Endpoint for students/educators to Re-Report an issue
    @PutMapping("/reports/my/{id}/reopen")
    @PreAuthorize("hasAnyRole('STUDENT', 'EDUCATOR')")
    public ResponseEntity<?> reopenReport(@PathVariable Long id, Authentication auth) {
        reportService.reopenReport(id, auth.getName());
        return ResponseEntity.ok(Map.of("message", "Report successfully re-opened"));
    }
}