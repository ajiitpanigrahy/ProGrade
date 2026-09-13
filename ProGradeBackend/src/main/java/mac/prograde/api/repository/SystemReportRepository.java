package mac.prograde.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mac.prograde.api.entity.SystemReport;

@Repository
public interface SystemReportRepository extends JpaRepository<SystemReport, Long> {
	
	// Add this inside mac.prograde.api.repository.SystemReportRepository
    List<SystemReport> findByReporterEmailOrderByCreatedAtDesc(String email);
    List<SystemReport> findAllByOrderByCreatedAtDesc();
	
}