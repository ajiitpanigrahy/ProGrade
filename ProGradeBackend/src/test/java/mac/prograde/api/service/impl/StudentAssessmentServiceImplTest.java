package mac.prograde.api.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import mac.prograde.api.entity.Assessment;
import mac.prograde.api.entity.AssessmentSubmission;
import mac.prograde.api.entity.Batch;
import mac.prograde.api.entity.Question;
import mac.prograde.api.repository.AssessmentRepository;
import mac.prograde.api.repository.AssessmentSubmissionRepository;
import mac.prograde.api.repository.BatchStudentRepository;

@ExtendWith(MockitoExtension.class)
public class StudentAssessmentServiceImplTest {

    @Mock private AssessmentRepository assessmentRepository;
    @Mock private BatchStudentRepository batchStudentRepository;
    @Mock private AssessmentSubmissionRepository submissionRepository;

    @InjectMocks
    private StudentAssessmentServiceImpl studentAssessmentService;

    private Assessment testExam;
    private Batch testBatch;
    private final String EXAM_ID = "EXM-123456";
    private final String STUDENT_EMAIL = "student@test.com";

    @BeforeEach
    void setUp() {
        testBatch = new Batch();
        testBatch.setId(UUID.randomUUID());
        testBatch.setName("Java Batch 1");

        Question q1 = new Question();
        q1.setId(1L);
        q1.setQuestionText("What is Java?");
        q1.setCorrectOption("A"); // The crucial part: this MUST NOT leak to the frontend!

        testExam = new Assessment();
        testExam.setId(100L);
        testExam.setExamId(EXAM_ID);
        testExam.setTitle("Core Java Test");
        testExam.setPassword("SECRET123");
        testExam.setMaxAttempts(2);
        testExam.setQuestions(List.of(q1));
    }

    @Test
    void testVerifyPasskey_Success() {
        when(assessmentRepository.findAll()).thenReturn(List.of(testExam));
        
        boolean isVerified = studentAssessmentService.verifyPasskey(EXAM_ID, "SECRET123");
        assertTrue(isVerified, "Passkey verification should return true for correct password.");
    }

    @Test
    void testGetPermittedPrivateAssessment_ThrowsExceptionIfNotInBatch() {
        testExam.setAssignedBatches(Set.of(testBatch)); // Exam belongs to Batch 1
        when(assessmentRepository.findAll()).thenReturn(List.of(testExam));
        when(batchStudentRepository.findByEmail(STUDENT_EMAIL)).thenReturn(List.of()); // Student belongs to NO batches

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, 
            () -> studentAssessmentService.getPermittedPrivateAssessment(EXAM_ID, STUDENT_EMAIL));
            
        assertTrue(exception.getMessage().contains("Access Restricted"));
    }

    @Test
    void testCheckMaxAttemptsStatus_BlocksAfterLimit() {
        when(assessmentRepository.findAll()).thenReturn(List.of(testExam));

        // Create 2 fake previous submissions
        AssessmentSubmission sub1 = new AssessmentSubmission();
        
        AssessmentSubmission sub2 = new AssessmentSubmission();
        sub2.setTotalScore(85.0);
        sub2.setMaxScore(100.0); // 🌟 ADDED: Mock the max score
        sub2.setTimeTaken(120);
        sub2.setSubmittedAt(LocalDateTime.now()); // 🌟 ADDED: Mock the timestamp
        
        when(submissionRepository.findByAssessmentIdAndStudentEmail(100L, STUDENT_EMAIL))
            .thenReturn(List.of(sub1, sub2));

        // Because Max Attempts is 2, and we have 2 submissions, this should trigger the block payload
        Map<String, Object> result = studentAssessmentService.checkMaxAttemptsStatus(EXAM_ID, STUDENT_EMAIL);
        
        assertNotNull(result);
        assertTrue((Boolean) result.get("maxAttemptsReached"));
        assertEquals(85.0, result.get("score"));
        assertEquals(100.0, result.get("maxScore")); // Verify it passes cleanly
    }

    @Test
    @SuppressWarnings("unchecked")
    void testGetSecureExamPayload_AnswersAreScrubbed() {
        when(assessmentRepository.findById(100L)).thenReturn(Optional.of(testExam));

        Map<String, Object> payload = studentAssessmentService.getSecureExamPayload("100");

        assertEquals(100L, payload.get("id"));
        
        // Extract the questions array from the JSON map
        List<Object> secureQuestions = (List<Object>) payload.get("questions");
        assertEquals(1, secureQuestions.size());

        // We assert that the DTO structure does not have the 'correctOption' field
        // Since we mapped it explicitly to 'StudentQuestionDTO' in the implementation, 
        // there is no way for the answer key to exist.
        assertFalse(secureQuestions.get(0).toString().contains("correctOption="), 
            "CRITICAL SECURITY FAILURE: Answer key leaked to frontend payload!");
    }
}