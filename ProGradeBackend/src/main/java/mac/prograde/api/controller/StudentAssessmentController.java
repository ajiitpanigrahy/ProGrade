package mac.prograde.api.controller;

import mac.prograde.api.dto.StudentDashboardDTO;
import mac.prograde.api.entity.Assessment;
import mac.prograde.api.security.RateLimiterService;
import mac.prograde.api.service.StudentAssessmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student/assessments")
@PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
public class StudentAssessmentController {

    @Autowired private StudentAssessmentService studentService;
    @Autowired private StudentAssessmentService studentAssessmentService;
    @Autowired private RateLimiterService rateLimiter;

    @Cacheable(value = "publicAssessments", key = "#auth.name")
    @GetMapping("/public")
    public ResponseEntity<?> getPublicAssessments(Authentication auth) {
        try {
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
    public ResponseEntity<?> verifyExamPassword(@PathVariable String examId, @RequestBody Map<String, String> payload, Authentication auth, HttpServletRequest request) {
        String clientIp = request.getRemoteAddr();
        String actionKey = "EXAM_AUTH_" + examId + "_" + auth.getName();

        // 🌟 RATE LIMIT: Prevent brute-forcing exam passwords (max 5 attempts per 15 mins)
        if (rateLimiter.isBlocked(clientIp, actionKey)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "Too many failed attempts. Exam locked for 15 minutes."));
        }

        try {
            Map<String, Object> attemptStatus = studentService.checkMaxAttemptsStatus(examId, auth.getName());
            if (attemptStatus != null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(attemptStatus);
            }

            String providedPassword = payload.get("password");
            boolean isVerified = studentService.verifyPasskey(examId, providedPassword);

            if (isVerified) {
                rateLimiter.resetAttempts(clientIp, actionKey);
                Assessment assessment = studentService.searchAssessmentByExamId(examId);
                String tempAccessToken = "VFY-" + UUID.randomUUID().toString();
                return ResponseEntity.ok(Map.of("verified", true, "accessToken", tempAccessToken, "assessmentId", assessment.getId()));
            } else {
                rateLimiter.recordFailedAttempt(clientIp, actionKey, 5, 15);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("verified", false, "error", "Invalid passkey token."));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }
    
    @Cacheable(value = "secureExamPayload", key = "#examId")
    @GetMapping("/{examId}/secure-payload")
    public ResponseEntity<?> getSecurePayload(@PathVariable String examId) {
        try {
            Map<String, Object> payload = studentService.getSecureExamPayload(examId);
            return ResponseEntity.ok(payload);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @Cacheable(value = "studentOverview", key = "#authentication.name")
    @GetMapping("/dashboard/overview")
    public ResponseEntity<StudentDashboardDTO> getDashboardOverview(Authentication authentication) {
        return ResponseEntity.ok(studentAssessmentService.getStudentDashboardOverview(authentication.getName()));
    }

    @Cacheable(value = "leaderboards", key = "#authentication.name + '_' + #time")
    @GetMapping("/dashboard/leaderboard")
    public ResponseEntity<?> getStudentLeaderboards(Authentication authentication, @RequestParam(required = false, defaultValue = "ALL_TIME") String time) {
        return ResponseEntity.ok(studentAssessmentService.getLeaderboards(authentication.getName(), time));
    }
}