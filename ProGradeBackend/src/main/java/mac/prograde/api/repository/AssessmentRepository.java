package mac.prograde.api.repository;

import mac.prograde.api.entity.Assessment;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
	
	// Inside AssessmentRepository.java
    List<Assessment> findByCreatorEmailOrderByCreatedAtDesc(String email);
    List<Assessment> findAllByOrderByCreatedAtDesc();
    List<Assessment> findByCreatorEmailOrCreatorRoleOrderByCreatedAtDesc(String email, String role);
 // Fetch Public Admin Exams
    List<Assessment> findByCreatorRoleOrderByCreatedAtDesc(String role);
    
    // Find Specific Exam by ID (For the Private Educator Search)
    java.util.Optional<Assessment> findByExamId(String examId);
	
}