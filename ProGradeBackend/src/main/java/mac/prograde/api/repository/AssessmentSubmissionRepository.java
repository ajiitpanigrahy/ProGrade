package mac.prograde.api.repository;

import mac.prograde.api.entity.AssessmentSubmission;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssessmentSubmissionRepository extends JpaRepository<AssessmentSubmission, Long> {
	
	List<AssessmentSubmission> findByStudentEmailOrderBySubmittedAtDesc(String email);
	
	List<AssessmentSubmission> findByAssessmentIdOrderByTotalScoreDesc(Long assessmentId);
	
	List<AssessmentSubmission> findByAssessmentIdAndStudentEmail(Long assessmentId, String studentEmail);
	
}