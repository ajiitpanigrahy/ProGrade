package mac.prograde.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import mac.prograde.api.repository.AssessmentSubmissionRepository;
import mac.prograde.api.repository.MalpracticeLogRepository;
import mac.prograde.api.repository.AssessmentRepository;
import mac.prograde.api.entity.AssessmentSubmission;
import mac.prograde.api.entity.MalpracticeLog;
import mac.prograde.api.entity.Assessment;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reports")
public class AssessmentReportController {

    @Autowired private AssessmentSubmissionRepository submissionRepository;
    @Autowired private MalpracticeLogRepository malpracticeLogRepository;
    @Autowired private AssessmentRepository assessmentRepository;

    @GetMapping("/assessments/{assessmentId}")
    @PreAuthorize("hasAnyRole('EDUCATOR', 'ADMIN')")
    public ResponseEntity<?> getAssessmentReports(@PathVariable Long assessmentId, Authentication auth) {
        Assessment exam = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new RuntimeException("Assessment not found."));

        // 🌟 STRICT ACCESS CONTROL
        // Admins can see all. Educators can ONLY see exams they created.
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !exam.getCreatorEmail().equals(auth.getName())) {
            return ResponseEntity.status(403).body(Map.of("error", "Access Denied. You can only view analytics for assessments you created."));
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
}