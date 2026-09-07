package mac.prograde.api.dto;

import lombok.Data;

@Data
public class EducatorOverviewKpis {
    public long activeExams;
    public long concurrentStudents;
    public long pendingEvaluations;
    public long proctoringFlags;
    public long authoredQuestions;
    public int easyPct;
    public int mediumPct;
    public int hardPct;
    public double avgPassRate;
    public String passRateGrowth;
    public String globalDeviation;
    public String gradingSLA;
    // Getters and Setters...
}