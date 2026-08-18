package mac.prograde.api.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mac.prograde.api.entity.BatchStudent;

@Repository
public interface BatchStudentRepository extends JpaRepository<BatchStudent, UUID> {
    boolean existsByEmailAndBatchId(String email, UUID batchId);
    
    List<BatchStudent> findByEmail(String email);
}