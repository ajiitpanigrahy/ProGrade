package mac.prograde.api.service.impl;

import mac.prograde.api.entity.Assessment;
import mac.prograde.api.entity.AssessmentSubmission;
import mac.prograde.api.entity.BatchStudent;
import mac.prograde.api.repository.AssessmentRepository;
import mac.prograde.api.repository.AssessmentSubmissionRepository;
import mac.prograde.api.repository.BatchStudentRepository;
import mac.prograde.api.repository.UserRepository;
import mac.prograde.api.service.StudentAssessmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import mac.prograde.api.dto.StudentDashboardDTO;
import mac.prograde.api.dto.StudentQuestionDTO;
import mac.prograde.api.entity.Question;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;

@Service
public class StudentAssessmentServiceImpl implements StudentAssessmentService {

    @Autowired private AssessmentRepository assessmentRepository;
    @Autowired private BatchStudentRepository batchStudentRepository;
    @Autowired private AssessmentSubmissionRepository submissionRepository;
    @Autowired private UserRepository userRepository; 
    
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public List<Assessment> getPublicAssessments() {
        return assessmentRepository.findAll().stream().filter(a -> "PUBLISHED".equals(a.getStatus())).collect(Collectors.toList());
    }

    @Override
    public Assessment searchAssessmentByExamId(String examId) {
        return assessmentRepository.findAll().stream()
                .filter(a -> a.getExamId() != null && a.getExamId().equalsIgnoreCase(examId)).findFirst()
                .orElseThrow(() -> new RuntimeException("Assessment not found"));
    }

    @Override
    public boolean verifyPasskey(String examId, String password) {
        return searchAssessmentByExamId(examId).getPassword().equals(password);
    }

    @Override
    public List<Assessment> getPermittedPublicAssessments(String studentEmail) {
        List<Assessment> publicExams = getPublicAssessments();
        List<UUID> myBatchIds = batchStudentRepository.findByEmail(studentEmail).stream()
                .map(bs -> bs.getBatch().getId()).collect(Collectors.toList());

        return publicExams.stream().filter(exam -> {
            if (exam.getAssignedBatches() == null || exam.getAssignedBatches().isEmpty()) return true;
            return exam.getAssignedBatches().stream().anyMatch(b -> myBatchIds.contains(b.getId()));
        }).collect(Collectors.toList());
    }

    @Override
    public Assessment getPermittedPrivateAssessment(String examId, String studentEmail) {
        Assessment assessment = searchAssessmentByExamId(examId);
        List<UUID> myBatchIds = batchStudentRepository.findByEmail(studentEmail).stream()
                .map(bs -> bs.getBatch().getId()).collect(Collectors.toList());

        if (assessment.getAssignedBatches() != null && !assessment.getAssignedBatches().isEmpty()) {
            if (!assessment.getAssignedBatches().stream().anyMatch(b -> myBatchIds.contains(b.getId()))) {
                throw new IllegalArgumentException("Access Restricted: You are not assigned to the operational batch for this assessment.");
            }
        }
        return assessment;
    }

    @Override
    public Map<String, Object> checkMaxAttemptsStatus(String examId, String studentEmail) {
        Assessment assessment = searchAssessmentByExamId(examId);
        int maxAttempts = (assessment.getMaxAttempts() != null && assessment.getMaxAttempts() > 0) ? assessment.getMaxAttempts() : 1;
        List<AssessmentSubmission> previousSubs = submissionRepository.findByAssessmentIdAndStudentEmail(assessment.getId(), studentEmail);

        if (previousSubs.size() >= maxAttempts) {
            AssessmentSubmission lastSub = previousSubs.get(previousSubs.size() - 1);
            int safeTime = 0;
            if (lastSub.getTimeTaken() != null && lastSub.getTimeTaken() > 0) safeTime = lastSub.getTimeTaken();
            else if (lastSub.getStartedAt() != null && lastSub.getSubmittedAt() != null) safeTime = (int) java.time.Duration.between(lastSub.getStartedAt(), lastSub.getSubmittedAt()).getSeconds();

            Map<String, Object> response = new HashMap<>();
            response.put("maxAttemptsReached", true);
            response.put("score", lastSub.getTotalScore());
            response.put("maxScore", lastSub.getMaxScore());
            response.put("timeTaken", safeTime);
            response.put("submittedAt", lastSub.getSubmittedAt());
            return response;
        }
        return null; 
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getSecureExamPayload(String idString) {
        Long dbId = Long.parseLong(idString);
        Assessment assessment = assessmentRepository.findById(dbId).orElseThrow();
        
        List<Question> independentQuestions = new ArrayList<>(assessment.getQuestions());
        Collections.shuffle(independentQuestions);
        List<StudentQuestionDTO> secureQuestions = new ArrayList<>();
        
        for (Question q : independentQuestions) {
            StudentQuestionDTO dto = new StudentQuestionDTO();
            dto.setId(q.getId());
            dto.setQuestionText(q.getQuestionText());
            dto.setOptionA(q.getOptionA());
            dto.setOptionB(q.getOptionB());
            dto.setOptionC(q.getOptionC());
            dto.setOptionD(q.getOptionD());
            dto.setTechnology(q.getTechnology());
            dto.setTopic(q.getTopic());
            dto.setDifficultyLevel(q.getDifficultyLevel() != null ? q.getDifficultyLevel().name() : null);
            dto.setQuestionType(q.getQuestionType());
            dto.setCodeSnippet(q.getCodeSnippet());
            dto.setCodeLanguage(q.getCodeLanguage());
            secureQuestions.add(dto);
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("id", assessment.getId());
        payload.put("examId", assessment.getExamId());
        payload.put("title", assessment.getTitle());
        payload.put("description", assessment.getDescription());
        payload.put("durationMinutes", assessment.getDurationMinutes());
        payload.put("totalQuestions", assessment.getTotalQuestions());
        payload.put("questions", secureQuestions); 
        return payload;
    }

    @Override
    @Transactional(readOnly = true)
    public StudentDashboardDTO getStudentDashboardOverview(String studentEmail) {
        List<AssessmentSubmission> allSubmissions = submissionRepository.findAll();
        
        List<AssessmentSubmission> mySubmissions = allSubmissions.stream()
                .filter(sub -> sub.getStudentEmail() != null && studentEmail.equalsIgnoreCase(sub.getStudentEmail().trim()))
                .sorted(Comparator.comparing(AssessmentSubmission::getSubmittedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();

        long totalTaken = mySubmissions.size();
        long totalCorrect = mySubmissions.stream().mapToLong(AssessmentSubmission::getCorrectCount).sum();
        long totalIncorrect = mySubmissions.stream().mapToLong(AssessmentSubmission::getIncorrectCount).sum();
        long totalAttempted = totalCorrect + totalIncorrect;

        double overallAccuracy = totalAttempted > 0 ? Math.round(((double) totalCorrect / totalAttempted * 100.0) * 10.0) / 10.0 : 0.0;
        double totalPctSum = mySubmissions.stream().mapToDouble(s -> {
            double max = s.getMaxScore() > 0 ? s.getMaxScore() : 100.0;
            return (s.getTotalScore() / max) * 100.0;
        }).sum();
        double avgScorePct = totalTaken > 0 ? Math.round((totalPctSum / totalTaken) * 10.0) / 10.0 : 0.0;

        double myTotalScore = mySubmissions.stream().mapToDouble(AssessmentSubmission::getTotalScore).sum();
        long myTotalPoints = (long) (myTotalScore * 10);

        Map<String, Double> studentScores = allSubmissions.stream().filter(sub -> sub.getStudentEmail() != null)
                .collect(Collectors.groupingBy(AssessmentSubmission::getStudentEmail, Collectors.summingDouble(AssessmentSubmission::getTotalScore)));
        
        List<Long> rankedPoints = studentScores.values().stream().map(score -> (long) (score * 10)).distinct().sorted(Comparator.reverseOrder()).toList();
        int myRank = rankedPoints.indexOf(myTotalPoints) + 1;
        if (myRank == 0 && myTotalPoints == 0) myRank = rankedPoints.size() + 1; 

        long availableExams = getPermittedPublicAssessments(studentEmail).size();

        List<StudentDashboardDTO.ScoreProgressionPoint> progression = mySubmissions.stream().map(sub -> {
            String title = assessmentRepository.findById(sub.getAssessmentId()).map(Assessment::getTitle).orElse("Exam #" + sub.getAssessmentId());
            double max = sub.getMaxScore() > 0 ? sub.getMaxScore() : 100.0;
            double pct = Math.round(((sub.getTotalScore() / max) * 100.0) * 10.0) / 10.0;
            return new StudentDashboardDTO.ScoreProgressionPoint(title, pct, sub.getSubmittedAt(), sub.getTotalScore(), max);
        }).toList();

        Map<String, List<Double>> techPercentages = new HashMap<>();
        
        List<StudentDashboardDTO.RecentSubmissionDTO> recent = mySubmissions.stream()
                .sorted(Comparator.comparing(AssessmentSubmission::getSubmittedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(sub -> {
                    Assessment a = assessmentRepository.findById(sub.getAssessmentId()).orElse(null);
                    String title = (a != null) ? a.getTitle() : "Assessment #" + sub.getAssessmentId();
                    
                    String dominantTech = "GENERAL";
                    if (sub.getTechBreakdownJson() != null && !sub.getTechBreakdownJson().equals("{}")) {
                        try {
                            Map<String, Map<String, Double>> breakdown = mapper.readValue(sub.getTechBreakdownJson(), new TypeReference<>() {});
                            dominantTech = breakdown.entrySet().stream()
                                    .max(Comparator.comparingDouble(e -> e.getValue().getOrDefault("max", 0.0)))
                                    .map(Map.Entry::getKey).orElse("GENERAL");
                            
                            for (Map.Entry<String, Map<String, Double>> entry : breakdown.entrySet()) {
                                double earned = entry.getValue().getOrDefault("earned", 0.0);
                                double max = entry.getValue().getOrDefault("max", 1.0);
                                double pct = max > 0 ? (earned / max) * 100.0 : 0.0;
                                techPercentages.computeIfAbsent(entry.getKey(), k -> new ArrayList<>()).add(pct);
                            }
                        } catch(Exception ignored) {}
                    } else if (a != null && a.getTitle() != null) {
                        dominantTech = a.getTitle().split(" ")[0].toUpperCase();
                    }
                    
                    double max = sub.getMaxScore() > 0 ? sub.getMaxScore() : 100.0;
                    double pct = Math.round(((sub.getTotalScore() / max) * 100.0) * 10.0) / 10.0;
                    int timeSec = sub.getTimeTaken() != null && sub.getTimeTaken() > 0 ? sub.getTimeTaken() : 0;
                    if (timeSec == 0 && sub.getStartedAt() != null && sub.getSubmittedAt() != null) timeSec = (int) java.time.Duration.between(sub.getStartedAt(), sub.getSubmittedAt()).getSeconds();
                    
                    return StudentDashboardDTO.RecentSubmissionDTO.builder().submissionId(sub.getId()).assessmentId(sub.getAssessmentId())
                            .assessmentTitle(title).technology(dominantTech).totalScore(sub.getTotalScore()).maxScore(max).percentage(pct)
                            .timeTakenSeconds(timeSec).passed(pct >= 60.0).submittedAt(sub.getSubmittedAt()).build();
                }).toList();

        List<StudentDashboardDTO.SkillProficiency> skillProficiencies = techPercentages.entrySet().stream().map(entry -> {
            double avg = entry.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            return new StudentDashboardDTO.SkillProficiency(entry.getKey(), entry.getValue().size(), Math.round(avg * 10.0) / 10.0);
        }).sorted(Comparator.comparingDouble(StudentDashboardDTO.SkillProficiency::getAveragePercentage).reversed()).toList();

        return StudentDashboardDTO.builder()
                .totalExamsTaken(totalTaken)
                .averageScorePercentage(avgScorePct)
                .overallAccuracy(overallAccuracy)
                .totalQuestionsAttempted(totalAttempted)
                .totalCorrectQuestions(totalCorrect)
                .availableExamsCount(availableExams)
                .totalRewardPoints(myTotalPoints) 
                .globalRank(myRank)               
                .scoreProgression(progression)
                .skillBreakdown(skillProficiencies)
                .recentSubmissions(recent)
                .build();
    }

    // 🌟 1. ROUTE OLD REQUESTS TO NEW LOGIC
    @Override
    @Transactional(readOnly = true)
    public mac.prograde.api.dto.LeaderboardDTO getLeaderboards(String studentEmail) {
        return getLeaderboards(studentEmail, "ALL_TIME");
    }

    // 🌟 2. BULLETPROOF PRACTICE EXAM CHECKER
    private boolean isPracticeExam(Assessment a) {
        if (a == null) return true;
        if ("STUDENT".equalsIgnoreCase(a.getCreatorRole())) return true;
        if ("PRACTICE".equalsIgnoreCase(a.getStatus())) return true;
        if (a.getTitle() != null) {
            String title = a.getTitle().toLowerCase();
            if (title.contains("practice") || title.contains("self")) return true;
        }
        return false;
    }

    @Override
    @Transactional(readOnly = true)
    public mac.prograde.api.dto.LeaderboardDTO getLeaderboards(String studentEmail, String timeFilter) {
        
        // 1. RESOLVE THE TIME FILTER
        java.time.LocalDateTime startDate = null;
        java.time.LocalDateTime now = java.time.LocalDateTime.now();

        if ("TODAY".equalsIgnoreCase(timeFilter)) {
            startDate = now.withHour(0).withMinute(0).withSecond(0).withNano(0);
        } else if ("WEEK".equalsIgnoreCase(timeFilter)) {
            startDate = now.minusDays(7);
        } else if ("MONTH".equalsIgnoreCase(timeFilter)) {
            startDate = now.minusMonths(1);
        }

        // 2. FETCH ALL DATA BASED ON TIME
        List<AssessmentSubmission> allSubs;
        if (startDate == null) {
            allSubs = submissionRepository.findAll();
        } else {
            allSubs = submissionRepository.findBySubmittedAtGreaterThanEqual(startDate);
        }
        
        java.util.function.Function<String, String> getName = (email) -> {
            if (email == null) return "Unknown";
            mac.prograde.api.entity.User u = userRepository.findByEmail(email);
            return u != null ? u.getFullName() : email.split("@")[0];
        };

        // CACHE ALL ASSESSMENTS FOR HIGH-SPEED LOOKUP
        Map<Long, Assessment> assessmentCache = assessmentRepository.findAll().stream()
                .collect(Collectors.toMap(Assessment::getId, a -> a));

        // =========================================================
        // 1. GLOBAL LEADERBOARD (Practice points ARE included here)
        // =========================================================
        Map<String, Double> globalScores = allSubs.stream()
                .filter(sub -> sub.getStudentEmail() != null)
                .collect(Collectors.groupingBy(AssessmentSubmission::getStudentEmail, Collectors.summingDouble(AssessmentSubmission::getTotalScore)));
        List<mac.prograde.api.dto.LeaderboardDTO.RankEntry> globalLeaderboard = buildRankedList(globalScores, studentEmail, getName);

        // =========================================================
        // 2. TRUE TECHNOLOGY LEADERBOARDS (Practice exams excluded)
        // =========================================================
        Map<String, Map<String, Double>> techScores = new HashMap<>();
        for (AssessmentSubmission sub : allSubs) {
            if (sub.getStudentEmail() == null || sub.getTechBreakdownJson() == null || sub.getTechBreakdownJson().equals("{}")) continue;
            
            // 🚨 BULLETPROOF BLOCKER
            if (isPracticeExam(assessmentCache.get(sub.getAssessmentId()))) continue;

            try {
                Map<String, Map<String, Double>> breakdown = mapper.readValue(sub.getTechBreakdownJson(), new TypeReference<>() {});
                for (Map.Entry<String, Map<String, Double>> techEntry : breakdown.entrySet()) {
                    String tech = techEntry.getKey();
                    double earned = techEntry.getValue().getOrDefault("earned", 0.0);
                    
                    techScores.putIfAbsent(tech, new HashMap<>());
                    techScores.get(tech).merge(sub.getStudentEmail(), earned, Double::sum);
                }
            } catch (Exception ignored) {}
        }
        
        List<mac.prograde.api.dto.LeaderboardDTO.CategoryLeaderboard> techBoards = techScores.entrySet().stream()
                .map(e -> new mac.prograde.api.dto.LeaderboardDTO.CategoryLeaderboard(e.getKey(), buildRankedList(e.getValue(), studentEmail, getName)))
                .filter(b -> !b.getRankings().isEmpty())
                .sorted((a, b) -> b.getRankings().size() - a.getRankings().size()) 
                .toList();

        // =========================================================
        // 3. EXAM LEADERBOARDS (Practice exams excluded)
        // =========================================================
        Map<String, Map<String, Double>> examScores = new HashMap<>();
        
        List<Long> permittedExamIds = new ArrayList<>();
        if (studentEmail != null) {
            permittedExamIds.addAll(getPermittedPublicAssessments(studentEmail).stream().map(Assessment::getId).toList());
            List<Long> myPastExamIds = allSubs.stream().filter(s -> studentEmail.equalsIgnoreCase(s.getStudentEmail())).map(AssessmentSubmission::getAssessmentId).toList();
            permittedExamIds.addAll(myPastExamIds); 
        }

        for (AssessmentSubmission sub : allSubs) {
            if (sub.getStudentEmail() == null) continue; 
            if (studentEmail != null && !permittedExamIds.contains(sub.getAssessmentId())) continue; 
            
            Assessment a = assessmentCache.get(sub.getAssessmentId());
            
            // 🚨 BULLETPROOF BLOCKER
            if (isPracticeExam(a)) continue;

            examScores.putIfAbsent(a.getTitle(), new HashMap<>());
            examScores.get(a.getTitle()).merge(sub.getStudentEmail(), sub.getTotalScore(), Math::max);
        }
        
        List<mac.prograde.api.dto.LeaderboardDTO.CategoryLeaderboard> examBoards = examScores.entrySet().stream()
                .map(e -> new mac.prograde.api.dto.LeaderboardDTO.CategoryLeaderboard(e.getKey(), buildRankedList(e.getValue(), studentEmail, getName)))
                .filter(b -> !b.getRankings().isEmpty())
                .sorted((a, b) -> a.getCategoryName().compareToIgnoreCase(b.getCategoryName()))
                .toList();

        // =========================================================
        // 4. BATCH LEADERBOARDS (Practice exams excluded)
        // =========================================================
        Map<String, Map<String, Double>> batchScores = new HashMap<>();
        List<BatchStudent> allBatchStudents = batchStudentRepository.findAll();
        Map<String, List<String>> emailToBatches = allBatchStudents.stream()
            .collect(Collectors.groupingBy(
                BatchStudent::getEmail,
                Collectors.mapping(bs -> bs.getBatch().getName(), Collectors.toList())
            ));

        for (AssessmentSubmission sub : allSubs) {
            if (sub.getStudentEmail() == null) continue;

            // 🚨 BULLETPROOF BLOCKER
            if (isPracticeExam(assessmentCache.get(sub.getAssessmentId()))) continue;

            List<String> assignedBatches = emailToBatches.getOrDefault(sub.getStudentEmail(), Collections.emptyList());
            for (String batchName : assignedBatches) {
                batchScores.putIfAbsent(batchName, new HashMap<>());
                batchScores.get(batchName).merge(sub.getStudentEmail(), sub.getTotalScore(), Double::sum);
            }
        }
        
        List<mac.prograde.api.dto.LeaderboardDTO.CategoryLeaderboard> batchBoards = batchScores.entrySet().stream()
                .map(e -> new mac.prograde.api.dto.LeaderboardDTO.CategoryLeaderboard(e.getKey(), buildRankedList(e.getValue(), studentEmail, getName)))
                .filter(b -> !b.getRankings().isEmpty())
                .sorted((a, b) -> a.getCategoryName().compareToIgnoreCase(b.getCategoryName()))
                .toList();

        // Assemble Final DTO
        return mac.prograde.api.dto.LeaderboardDTO.builder()
                .globalLeaderboard(globalLeaderboard)
                .technologyLeaderboards(techBoards)
                .assessmentLeaderboards(examBoards)
                .batchLeaderboards(batchBoards)
                .build();
    }

    private List<mac.prograde.api.dto.LeaderboardDTO.RankEntry> buildRankedList(
            Map<String, Double> scoreMap, 
            String currentEmail, 
            java.util.function.Function<String, String> nameFetcher) {
        
        List<Map.Entry<String, Double>> sortedList = scoreMap.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .toList();

        List<mac.prograde.api.dto.LeaderboardDTO.RankEntry> rankings = new ArrayList<>();
        int rank = 1;
        double lastScore = -1;
        int actualRank = 1;

        for (Map.Entry<String, Double> entry : sortedList) {
            if (lastScore != -1 && entry.getValue() < lastScore) {
                rank = actualRank;
            }
            long points = (long) (entry.getValue() * 10);
            rankings.add(mac.prograde.api.dto.LeaderboardDTO.RankEntry.builder()
                    .rank(rank)
                    .studentName(nameFetcher.apply(entry.getKey()))
                    .email(entry.getKey())
                    .rewardPoints(points)
                    .isCurrentUser(entry.getKey().equalsIgnoreCase(currentEmail))
                    .build());
            
            lastScore = entry.getValue();
            actualRank++;
        }
        return rankings;
    }
}