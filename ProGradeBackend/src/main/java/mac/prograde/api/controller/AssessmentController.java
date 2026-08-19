package mac.prograde.api.controller;

import mac.prograde.api.dto.AssessmentRequestDTO;
import mac.prograde.api.entity.Assessment;
import mac.prograde.api.entity.AssessmentSubmission;
import mac.prograde.api.entity.MalpracticeLog;
import mac.prograde.api.service.AssessmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/assessments")
@PreAuthorize("hasAnyRole('ADMIN', 'EDUCATOR')")
public class AssessmentController {

    @Autowired
    private AssessmentService assessmentService;
    
    @Autowired
    private mac.prograde.api.repository.AssessmentSubmissionRepository submissionRepository;

    @Autowired
    private mac.prograde.api.repository.MalpracticeLogRepository malpracticeLogRepository;

    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDUCATOR')") // 🌟 Allow both roles!
    public ResponseEntity<?> createAssessment(@RequestBody AssessmentRequestDTO dto) {
        try {
            assessmentService.createAssessment(dto);
            return ResponseEntity.ok(Map.of("message", "Assessment Blueprint Created Successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 🌟 SECURED GET ENDPOINT: Filters tests based on Admin vs Educator permissions
    @GetMapping("")
    public ResponseEntity<?> getAllAssessments(Authentication auth) {
        String currentUserEmail = auth.getName();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        List<Assessment> allAssessments = assessmentService.getAllAssessments();

        if (isAdmin) {
            return ResponseEntity.ok(allAssessments);
        }

        // Filter for Educators: Only show their own exams OR exams they are explicitly given access to
        List<Assessment> allowedAssessments = allAssessments.stream()
                .filter(exam -> {
                    if (exam.getCreatorEmail() != null && exam.getCreatorEmail().equals(currentUserEmail)) {
                        return true;
                    }
                    if (exam.getAllowedEducators() != null && exam.getAllowedEducators().contains(currentUserEmail)) {
                        return true;
                    }
                    return false;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(allowedAssessments);
    }
    
//    @DeleteMapping("/{id}")
//    public ResponseEntity<?> deleteAssessment(@PathVariable Long id) {
//        assessmentService.deleteAssessment(id);
//        return ResponseEntity.ok(Map.of("message", "Assessment deleted successfully."));
//    }
//
//    @PatchMapping("/{id}/toggle-status")
//    public ResponseEntity<?> toggleAssessmentStatus(@PathVariable Long id) {
//        try {
//            return ResponseEntity.ok(assessmentService.toggleStatus(id));
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
//        }
//    }
//
//    @PatchMapping("/{id}/postpone")
//    public ResponseEntity<?> postponeAssessment(@PathVariable Long id, @RequestBody Map<String, String> payload) {
//        try {
//            java.time.LocalDateTime newTime = java.time.LocalDateTime.parse(payload.get("startTime"));
//            return ResponseEntity.ok(assessmentService.postponeAssessment(id, newTime));
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(Map.of("error", "Invalid date format. " + e.getMessage()));
//        }
//    }

    // 🌟 NEW ENDPOINT: Allows Admins to update who can view an assessment's reports
    @PutMapping("/{id}/allow-educators")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateAllowedEducators(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            Assessment exam = assessmentService.findByAssessmentId(id);
            if (exam == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Assessment not found."));
            }
            
            exam.setAllowedEducators(payload.get("allowedEducators"));
            // Save it using your service or repository
            assessmentService.saveAssessment(exam); // Ensure saveAssessment(Assessment e) exists in your service

            return ResponseEntity.ok(Map.of("message", "Educator access updated successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/{assessmentId}/reports")
    @PreAuthorize("hasAnyRole('EDUCATOR', 'ADMIN')")
    public ResponseEntity<?> getAssessmentReports(@PathVariable Long assessmentId, Authentication auth) {
        Assessment exam = assessmentService.findByAssessmentId(assessmentId);
        
        if (exam == null) {
            throw new RuntimeException("Assessment not found.");
        }

        // Security check: Admins, Test Creators, or explicitly allowed Educators can view reports
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isCreator = exam.getCreatorEmail() != null && exam.getCreatorEmail().equals(auth.getName());
        boolean isAllowed = exam.getAllowedEducators() != null && exam.getAllowedEducators().contains(auth.getName());

        if (!isAdmin && !isCreator && !isAllowed) {
            return ResponseEntity.status(403).body(Map.of("error", "Access Denied. You do not have permission to view reports for this exam."));
        }

        List<AssessmentSubmission> submissions = submissionRepository.findByAssessmentIdOrderByTotalScoreDesc(assessmentId);
        List<MalpracticeLog> fraudLogs = malpracticeLogRepository.findByAssessmentId(assessmentId);

        double avgScore = submissions.isEmpty() ? 0 : submissions.stream().mapToDouble(AssessmentSubmission::getTotalScore).average().orElse(0);

        return ResponseEntity.ok(Map.of(
                "examTitle", exam.getTitle(),
                "totalQuestions", exam.getTotalQuestions(),
                "totalStudents", submissions.size(),
                "averageScore", Math.round(avgScore * 100.0) / 100.0,
                "submissions", submissions,
                "fraudLogs", fraudLogs
        ));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAssessment(@PathVariable Long id) {
        assessmentService.deleteAssessment(id);
        return ResponseEntity.ok(Map.of("message", "Assessment deleted successfully"));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleAssessmentStatus(@PathVariable Long id) {
        Assessment updated = assessmentService.toggleStatus(id);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/postpone")
    public ResponseEntity<?> postponeAssessment(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        LocalDateTime newStartTime = LocalDateTime.parse(payload.get("startTime"));
        Assessment updated = assessmentService.postponeAssessment(id, newStartTime);
        return ResponseEntity.ok(updated);
    }
    
 // 🌟 FETCH QUESTIONS FOR BLUEPRINT TAB
    @GetMapping("/{id}/questions")
    public ResponseEntity<?> getAssessmentBlueprintQuestions(@PathVariable Long id) {
        try {
            // Adjust the service call to match your actual service method
            Assessment assessment = assessmentService.findByAssessmentId(id);
            return ResponseEntity.ok(assessment.getQuestions());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}