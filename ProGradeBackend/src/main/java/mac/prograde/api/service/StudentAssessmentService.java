package mac.prograde.api.service;

import mac.prograde.api.entity.Assessment;
import mac.prograde.api.repository.AssessmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentAssessmentService {

    @Autowired
    private AssessmentRepository assessmentRepository;

    // 1. Get all public exams (created by ADMIN)
    public List<Assessment> getPublicAssessments() {
        return assessmentRepository.findByCreatorRoleOrderByCreatedAtDesc("ADMIN");
    }

    // 2. Search for a specific exam by its ID (EXM-XXXXXX)
    public Assessment searchAssessmentByExamId(String examId) {
        return assessmentRepository.findByExamId(examId.toUpperCase())
                .orElseThrow(() -> new RuntimeException("No assessment found with ID: " + examId));
    }

    // 3. Verify the passkey securely
    public boolean verifyPasskey(String examId, String password) {
        Assessment assessment = searchAssessmentByExamId(examId);
        // Compare the provided password with the database password
        return assessment.getPassword().equals(password);
    }
}