package mac.prograde.api.service.impl;

import mac.prograde.api.entity.Assessment;
import mac.prograde.api.entity.AssessmentSubmission;
import mac.prograde.api.repository.AssessmentRepository;
import mac.prograde.api.repository.AssessmentSubmissionRepository;
import mac.prograde.api.repository.BatchStudentRepository;
import mac.prograde.api.service.StudentAssessmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StudentAssessmentServiceImpl implements StudentAssessmentService {

    @Autowired
    private AssessmentRepository assessmentRepository;
    @Autowired
    private BatchStudentRepository batchStudentRepository;
    @Autowired
    private AssessmentSubmissionRepository submissionRepository;

    @Override
    public List<Assessment> getPublicAssessments() {
        return assessmentRepository.findAll().stream().filter(a -> "PUBLISHED".equals(a.getStatus()))
                .collect(Collectors.toList());
    }

    @Override
    public Assessment searchAssessmentByExamId(String examId) {
        return assessmentRepository.findAll().stream()
                .filter(a -> a.getExamId() != null && a.getExamId().equalsIgnoreCase(examId)).findFirst()
                .orElseThrow(() -> new RuntimeException("Assessment not found"));
    }

    @Override
    public boolean verifyPasskey(String examId, String password) {
        Assessment assessment = searchAssessmentByExamId(examId);
        return assessment.getPassword().equals(password);
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
            boolean hasAccess = assessment.getAssignedBatches().stream().anyMatch(b -> myBatchIds.contains(b.getId()));
            if (!hasAccess) {
                throw new IllegalArgumentException("Access Restricted: You are not assigned to the operational batch for this assessment. Please contact your educator.");
            }
        }
        return assessment;
    }

    @Override
    public Map<String, Object> checkMaxAttemptsStatus(String examId, String studentEmail) {
        Assessment assessment = searchAssessmentByExamId(examId);
        int maxAttempts = (assessment.getMaxAttempts() != null && assessment.getMaxAttempts() > 0)
                ? assessment.getMaxAttempts()
                : 1;

        List<AssessmentSubmission> previousSubs = submissionRepository
                .findByAssessmentIdAndStudentEmail(assessment.getId(), studentEmail);

        if (previousSubs.size() >= maxAttempts) {
            AssessmentSubmission lastSub = previousSubs.get(previousSubs.size() - 1);
            
            // 🌟 BULLETPROOF TIME CALCULATION
            int safeTime = 0;
            if (lastSub.getTimeTaken() != null && lastSub.getTimeTaken() > 0) {
                safeTime = lastSub.getTimeTaken();
            } else if (lastSub.getStartedAt() != null && lastSub.getSubmittedAt() != null) {
                safeTime = (int) java.time.Duration.between(lastSub.getStartedAt(), lastSub.getSubmittedAt()).getSeconds();
            }

            return Map.of(
                    "maxAttemptsReached", true, 
                    "score", lastSub.getTotalScore(), 
                    "maxScore", lastSub.getMaxScore(),
                    "timeTaken", safeTime, // Automatically uses calculated time!
                    "submittedAt", lastSub.getSubmittedAt()
            );
        }
        return null; 
    }
}