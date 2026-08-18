package mac.prograde.api.repository;

import mac.prograde.api.entity.MalpracticeLog;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MalpracticeLogRepository extends JpaRepository<MalpracticeLog, Long> {
	
	List<MalpracticeLog> findByAssessmentId(Long assessmentId);
	
}