package mac.prograde.api.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import mac.prograde.api.dto.DistributionData;
import mac.prograde.api.dto.EducatorDashboardCharts;
import mac.prograde.api.dto.EducatorOverviewKpis;
import mac.prograde.api.entity.Assessment;
import mac.prograde.api.entity.AssessmentSubmission;
import mac.prograde.api.repository.AssessmentRepository;
import mac.prograde.api.repository.AssessmentSubmissionRepository;
import mac.prograde.api.repository.QuestionRepository;

@Service
public class EducatorAnalyticsService {

    @Autowired
    private AssessmentRepository assessmentRepo;
    
    @Autowired
    private AssessmentSubmissionRepository submissionRepo;
    
    @Autowired
    private QuestionRepository questionRepo;

    public EducatorOverviewKpis calculateKpis() {
        EducatorOverviewKpis kpi = new EducatorOverviewKpis();
        
        // 1. Database Counts
        kpi.setActiveExams(assessmentRepo.countByStatus("PUBLISHED"));
        
        // 🌟 FIX: Set pending evaluations to 0 since AssessmentSubmission has no 'status' field yet
        kpi.setPendingEvaluations(0);
        kpi.setProctoringFlags(0);
        
        // 2. Question Difficulty Ratios
        long totalQs = questionRepo.count();
        kpi.setAuthoredQuestions(totalQs);
        if (totalQs > 0) {
            kpi.setEasyPct((int) ((questionRepo.countByDifficultyLevel("EASY") * 100) / totalQs));
            kpi.setMediumPct((int) ((questionRepo.countByDifficultyLevel("MEDIUM") * 100) / totalQs));
            kpi.setHardPct((int) ((questionRepo.countByDifficultyLevel("HARD") * 100) / totalQs));
        } else {
            kpi.setEasyPct(0);
            kpi.setMediumPct(0);
            kpi.setHardPct(0);
        }

        // 3. Score Calculations
        Double avgScore = submissionRepo.getAverageScore(); 
        kpi.setAvgPassRate(avgScore != null ? Math.round(avgScore * 10.0) / 10.0 : 0.0);
        
        // Hardcoded generic SLA and static strings
        kpi.setPassRateGrowth("+3.2%");
        kpi.setGlobalDeviation("+1.8%");
        kpi.setGradingSLA("< 24 hrs");
        kpi.setConcurrentStudents(0); 

        return kpi;
    }

    public EducatorDashboardCharts calculateCharts() {
        EducatorDashboardCharts charts = new EducatorDashboardCharts();

        // Fetch all Assessments into a HashMap to quickly lookup Total Questions
        List<Assessment> allAssessments = assessmentRepo.findAll();
        Map<Long, Integer> assessmentQuestionCounts = new HashMap<>();
        for (Assessment a : allAssessments) {
            assessmentQuestionCounts.put(a.getId(), a.getTotalQuestions());
        }

        // 1. Distribution (Bell Curve)
        List<DistributionData> distribution = new ArrayList<>();
        List<AssessmentSubmission> allSubmissions = submissionRepo.findAll();
        long[] brackets = new long[7]; // <40, 40, 50, 60, 70, 80, 90
        
        for (AssessmentSubmission s : allSubmissions) {
            int totalQuestions = assessmentQuestionCounts.getOrDefault(s.getAssessmentId(), 1);
            if (totalQuestions <= 0) totalQuestions = 1;

            double pct = ((double) s.getTotalScore() / totalQuestions) * 100;
            
            if (pct < 40) brackets[0]++;
            else if (pct < 50) brackets[1]++;
            else if (pct < 60) brackets[2]++;
            else if (pct < 70) brackets[3]++;
            else if (pct < 80) brackets[4]++;
            else if (pct < 90) brackets[5]++;
            else brackets[6]++;
        }

        String[] labels = {"< 40%", "40-49%", "50-59%", "60-69%", "70-79%", "80-89%", "90-100%"};
        for (int i = 0; i < 7; i++) {
            DistributionData d = new DistributionData();
            d.setBracket(labels[i]);
            d.setStudents(brackets[i]);
            distribution.add(d);
        }
        charts.setDistribution(distribution);

        // 2. Return empty arrays for Velocity and Mastery so the React frontend safely renders 'No Data'
        charts.setVelocity(new ArrayList<>()); 
        charts.setMastery(new ArrayList<>());

        return charts;
    }
}