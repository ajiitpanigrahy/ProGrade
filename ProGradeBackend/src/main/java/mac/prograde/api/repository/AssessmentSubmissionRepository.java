package mac.prograde.api.repository;

import mac.prograde.api.entity.AssessmentSubmission;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AssessmentSubmissionRepository extends JpaRepository<AssessmentSubmission, Long> {

	List<AssessmentSubmission> findByStudentEmailOrderBySubmittedAtDesc(String email);

	List<AssessmentSubmission> findByAssessmentIdOrderByTotalScoreDesc(Long assessmentId);

	@Query("SELECT a FROM AssessmentSubmission a WHERE a.assessmentId = :assessmentId AND a.studentEmail = :studentEmail")
	List<AssessmentSubmission> findByAssessmentIdAndStudentEmail(@Param("assessmentId") Long assessmentId, @Param("studentEmail") String studentEmail);

	// 🌟 FIX: Removed countByStatus because 'status' is not a field in AssessmentSubmission

	// Calculates the global average passing rate
	@Query("SELECT AVG((s.totalScore * 1.0 / a.totalQuestions) * 100) FROM AssessmentSubmission s, Assessment a WHERE s.assessmentId = a.id AND a.totalQuestions > 0")
	Double getAverageScore();
	
	@Query("SELECT s FROM AssessmentSubmission s, Assessment a WHERE s.assessmentId = a.id AND a.creatorRole != 'STUDENT'")
	List<AssessmentSubmission> findAllOfficialSubmissions();
	
	@Query("SELECT s FROM AssessmentSubmission s, Assessment a WHERE s.assessmentId = a.id " +
		       "AND a.creatorRole != 'STUDENT' " +
		       "AND (:startDate IS NULL OR s.submittedAt >= :startDate)")
		List<AssessmentSubmission> findOfficialSubmissionsSince(@Param("startDate") LocalDateTime startDate);
	
	// Add this inside AssessmentSubmissionRepository.java
	List<AssessmentSubmission> findBySubmittedAtGreaterThanEqual(java.time.LocalDateTime date);

}