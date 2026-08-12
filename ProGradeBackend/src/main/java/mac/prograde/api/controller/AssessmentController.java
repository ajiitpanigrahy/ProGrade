package mac.prograde.api.controller;

import mac.prograde.api.dto.AssessmentRequestDTO;
import mac.prograde.api.service.AssessmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/assessments")
@PreAuthorize("hasAnyRole('ADMIN', 'EDUCATOR')")
public class AssessmentController {

    @Autowired
    private AssessmentService assessmentService;

    @PostMapping("/create")
    public ResponseEntity<?> createAssessment(@RequestBody AssessmentRequestDTO dto) {
        try {
            assessmentService.createAssessment(dto);
            return ResponseEntity.ok(Map.of("message", "Assessment Blueprint Created Successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("")
    public ResponseEntity<?> getAllAssessments() {
        return ResponseEntity.ok(assessmentService.getAllAssessments());
    }
    
 // Add these under your existing methods:

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAssessment(@PathVariable Long id) {
        assessmentService.deleteAssessment(id);
        return ResponseEntity.ok(Map.of("message", "Assessment deleted successfully."));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleAssessmentStatus(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(assessmentService.toggleStatus(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/postpone")
    public ResponseEntity<?> postponeAssessment(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            // Parses the standard ISO string (e.g. "2026-08-10T14:30") from the frontend
            java.time.LocalDateTime newTime = java.time.LocalDateTime.parse(payload.get("startTime"));
            return ResponseEntity.ok(assessmentService.postponeAssessment(id, newTime));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid date format. " + e.getMessage()));
        }
    }
    
}