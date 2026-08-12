package mac.prograde.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/educator")
@PreAuthorize("hasAnyRole('EDUCATOR', 'ADMIN')")
public class EducatorDashboardController {

    // 1. For the Overview KPI Cards
    @GetMapping("/overview/kpis")
    public ResponseEntity<?> getOverviewKPIs() {
        return ResponseEntity.ok(Map.of(
                "activeExams", 3,
                "concurrentStudents", 42,
                "pendingEvaluations", 18,
                "proctoringFlags", 12,
                "authoredQuestions", 420,
                "easyPct", 65, "mediumPct", 25, "hardPct", 10,
                "avgPassRate", 74.8,
                "passRateGrowth", "+2.4%"
        ));
    }

    // 2. For the Overview Charts
    @GetMapping("/overview/charts")
    public ResponseEntity<?> getDashboardCharts() {
        List<Map<String, Object>> velocity = List.of(
            Map.of("date", "Aug 1", "submissions", 12), Map.of("date", "Aug 5", "submissions", 45),
            Map.of("date", "Aug 10", "submissions", 28), Map.of("date", "Aug 15", "submissions", 85)
        );
        List<Map<String, Object>> mastery = List.of(
            Map.of("topic", "Spring DI", "accuracy", 92), Map.of("topic", "Java Streams", "accuracy", 85),
            Map.of("topic", "Bean Lifecycle", "accuracy", 34)
        );
        List<Map<String, Object>> distribution = List.of(
            Map.of("bracket", "< 50%", "students", 12), Map.of("bracket", "70-79%", "students", 85),
            Map.of("bracket", "90-100%", "students", 18)
        );
        return ResponseEntity.ok(Map.of("velocity", velocity, "mastery", mastery, "distribution", distribution));
    }

    // 3. For the Grading Desk Tab
    @GetMapping("/grading/pending")
    public ResponseEntity<?> getPendingReviews() {
        List<Map<String, Object>> pending = List.of(
            Map.of("id", 101, "studentName", "Alex Carter", "examTitle", "Spring Boot Security Midterm", "score", 88.5, "status", "FLAGGED_REVIEW", "timeSpent", "42m 10s"),
            Map.of("id", 102, "studentName", "Sarah Jenkins", "examTitle", "Core Java Fundamentals", "score", 94.0, "status", "AUTO_GRADED", "timeSpent", "38m 45s")
        );
        return ResponseEntity.ok(pending);
    }

    // 4. For the Student Analytics Tab
    @GetMapping("/analytics/mastery")
    public ResponseEntity<?> getTopicMastery() {
        List<Map<String, Object>> radarData = List.of(
            Map.of("topic", "Spring Core", "score", 92, "fullMark", 100),
            Map.of("topic", "Hibernate", "score", 65, "fullMark", 100),
            Map.of("topic", "REST APIs", "score", 88, "fullMark", 100),
            Map.of("topic", "Security", "score", 55, "fullMark", 100)
        );
        return ResponseEntity.ok(radarData);
    }
}