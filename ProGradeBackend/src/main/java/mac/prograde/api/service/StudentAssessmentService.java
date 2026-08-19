package mac.prograde.api.service;

import mac.prograde.api.entity.Assessment;
import java.util.List;
import java.util.Map;

public interface StudentAssessmentService {
    List<Assessment> getPublicAssessments();
    Assessment searchAssessmentByExamId(String examId);
    boolean verifyPasskey(String examId, String password);
    List<Assessment> getPermittedPublicAssessments(String studentEmail);
    Assessment getPermittedPrivateAssessment(String examId, String studentEmail);
    Map<String, Object> checkMaxAttemptsStatus(String examId, String studentEmail);
 // 🌟 ADD THIS METHOD
    java.util.Map<String, Object> getSecureExamPayload(String examId);
}