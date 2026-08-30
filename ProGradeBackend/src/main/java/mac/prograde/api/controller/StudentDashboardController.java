package mac.prograde.api.controller;

import lombok.RequiredArgsConstructor;
import mac.prograde.api.dto.LeaderboardDTO;
import mac.prograde.api.dto.StudentDashboardDTO;
import mac.prograde.api.service.StudentAssessmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/student/dashboard")
@RequiredArgsConstructor
public class StudentDashboardController {

    private final StudentAssessmentService studentAssessmentService;

    // 🌟 1. Endpoint for the Overview Tab Charts & KPIs
    @GetMapping("/overview")
    public ResponseEntity<StudentDashboardDTO> getDashboardOverview(Authentication authentication) {
        String studentEmail = authentication.getName();
        return ResponseEntity.ok(studentAssessmentService.getStudentDashboardOverview(studentEmail));
    }

    // 🌟 2. Endpoint for the Leaderboard Tab
    @GetMapping("/leaderboard")
    public ResponseEntity<LeaderboardDTO> getLeaderboards(Authentication authentication) {
        String studentEmail = authentication.getName();
        return ResponseEntity.ok(studentAssessmentService.getLeaderboards(studentEmail));
    }
}