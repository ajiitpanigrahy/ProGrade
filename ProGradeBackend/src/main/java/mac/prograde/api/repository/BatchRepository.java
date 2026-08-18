package mac.prograde.api.repository;
import mac.prograde.api.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface BatchRepository extends JpaRepository<Batch, UUID> {
    Optional<Batch> findByName(String name);
}