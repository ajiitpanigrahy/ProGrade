package mac.prograde.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDashboardDTO {

    // 🌟 1. Core KPIs
    private long totalExamsTaken;
    private double averageScorePercentage;
    private double overallAccuracy;
    private long totalQuestionsAttempted;
    private long totalCorrectQuestions;
    private long availableExamsCount;
    private long totalRewardPoints;
    private int globalRank;

    // 🌟 2. Score Progression Over Time (For Area/Line Chart)
    private List<ScoreProgressionPoint> scoreProgression;

    // 🌟 3. Skill & Technology Breakdown (For Bar/Radar Charts)
    private List<SkillProficiency> skillBreakdown;

    // 🌟 4. Recent Assessment Submissions
    private List<RecentSubmissionDTO> recentSubmissions;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ScoreProgressionPoint {
        private String examTitle;
        private double scorePercentage;
        private LocalDateTime submittedAt;
        private double totalScore;
        private double maxScore;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SkillProficiency {
        private String technology;
        private int assessmentsTaken;
        private double averagePercentage;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class RecentSubmissionDTO {
        private Long submissionId;
        private Long assessmentId;
        private String assessmentTitle;
        private String technology;
        private double totalScore;
        private double maxScore;
        private double percentage;
        private int timeTakenSeconds;
        private boolean passed;
        private LocalDateTime submittedAt;
     // Add these two fields to mac.prograde.api.dto.StudentDashboardDTO
       
    }
}