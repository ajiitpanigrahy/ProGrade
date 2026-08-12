package mac.prograde.api.controller;

import mac.prograde.api.entity.Assessment;
import mac.prograde.api.service.StudentAssessmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student/assessments")
@PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')") // Admin allowed for testing
public class StudentAssessmentController {

    @Autowired
    private StudentAssessmentService studentService;

    // 1. Fetch all Public Admin Assessments for the Default Grid
    @GetMapping("/public")
    public ResponseEntity<?> getPublicAssessments() {
        try {
            List<Assessment> publicExams = studentService.getPublicAssessments();
            
            // 🌟 CRITICAL SECURITY: Strip the password from the payload so students can't cheat via Network Tab
            publicExams.forEach(exam -> exam.setPassword(null));
            
            return ResponseEntity.ok(publicExams);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 2. Search for Private Educator Exams via Exam ID
    @GetMapping("/search")
    public ResponseEntity<?> searchPrivateAssessment(@RequestParam String examId) {
        try {
            Assessment assessment = studentService.searchAssessmentByExamId(examId);
            
            // 🌟 CRITICAL SECURITY: Strip the password
            assessment.setPassword(null); 
            
            return ResponseEntity.ok(assessment);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // 3. Secure Passkey Validation Loop
    @PostMapping("/{examId}/verify")
    public ResponseEntity<?> verifyExamPassword(@PathVariable String examId, @RequestBody Map<String, String> payload) {
        try {
            String providedPassword = payload.get("password");
            boolean isVerified = studentService.verifyPasskey(examId, providedPassword);

            if (isVerified) {
                Assessment assessment = studentService.searchAssessmentByExamId(examId);
                
                // Generate a temporary access token for the live exam viewport
                String tempAccessToken = "VFY-" + UUID.randomUUID().toString();
                
                return ResponseEntity.ok(Map.of(
                        "verified", true, 
                        "accessToken", tempAccessToken,
                        "assessmentId", assessment.getId()
                ));
            } else {
            	return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("verified", false, "error", "Invalid passkey token."));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }
}