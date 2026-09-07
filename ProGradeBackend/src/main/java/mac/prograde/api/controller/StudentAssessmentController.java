package mac.prograde.api.controller;

import mac.prograde.api.dto.StudentDashboardDTO;
import mac.prograde.api.entity.Assessment;
import mac.prograde.api.service.StudentAssessmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student/assessments")
@PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
public class StudentAssessmentController {

    @Autowired
    private StudentAssessmentService studentService;
    @Autowired
    private StudentAssessmentService studentAssessmentService;

    @GetMapping("/public")
    public ResponseEntity<?> getPublicAssessments(Authentication auth) {
        try {
            // Logic moved cleanly to the Service layer
            List<Assessment> exams = studentService.getPermittedPublicAssessments(auth.getName());
            exams.forEach(exam -> exam.setPassword(null));
            return ResponseEntity.ok(exams);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchPrivateAssessment(@RequestParam String examId, Authentication auth) {
        try {
            // Logic moved cleanly to the Service layer
            Assessment assessment = studentService.getPermittedPrivateAssessment(examId, auth.getName());
            assessment.setPassword(null);
            return ResponseEntity.ok(assessment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "No active educator exam found with that ID."));
        }
    }

    @PostMapping("/{examId}/verify")
    public ResponseEntity<?> verifyExamPassword(@PathVariable String examId, @RequestBody Map<String, String> payload, Authentication auth) {
        try {
            // 🌟 1. MAX ATTEMPTS INTERCEPTOR
            // We pass the examId and the student's email to see if they are blocked!
            Map<String, Object> attemptStatus = studentService.checkMaxAttemptsStatus(examId, auth.getName());
            
            if (attemptStatus != null) {
                // If attemptStatus is not null, they hit the limit! Return a 400 Bad Request
                // to trigger your gorgeous custom UI Trophy Popup.
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(attemptStatus);
            }

            // 🌟 2. NORMAL PASSKEY VERIFICATION
            String providedPassword = payload.get("password");
            boolean isVerified = studentService.verifyPasskey(examId, providedPassword);

            if (isVerified) {
                Assessment assessment = studentService.searchAssessmentByExamId(examId);
                String tempAccessToken = "VFY-" + UUID.randomUUID().toString();
                return ResponseEntity.ok(Map.of("verified", true, "accessToken", tempAccessToken, "assessmentId", assessment.getId()));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("verified", false, "error", "Invalid passkey token."));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/{examId}/secure-payload")
    public ResponseEntity<?> getSecurePayload(@PathVariable String examId) {
        try {
            Map<String, Object> payload = studentService.getSecureExamPayload(examId);
            return ResponseEntity.ok(payload);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/dashboard/overview")
    public ResponseEntity<StudentDashboardDTO> getDashboardOverview(Authentication authentication) {
        String studentEmail = authentication.getName();
        StudentDashboardDTO dto = studentAssessmentService.getStudentDashboardOverview(studentEmail);
        return ResponseEntity.ok(dto);
    }

	@GetMapping("/dashboard/leaderboard")
	public ResponseEntity<?> getStudentLeaderboards(
	        Authentication authentication, 
	        @RequestParam(required = false, defaultValue = "ALL_TIME") String time) {
	    
	    String studentEmail = authentication.getName();
	    return ResponseEntity.ok(studentAssessmentService.getLeaderboards(studentEmail, time));
	}
}