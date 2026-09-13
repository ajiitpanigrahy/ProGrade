package mac.prograde.api.repository;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import mac.prograde.api.entity.Batch;

public interface BatchRepository extends JpaRepository<Batch, UUID> {
    Optional<Batch> findByName(String name);
}