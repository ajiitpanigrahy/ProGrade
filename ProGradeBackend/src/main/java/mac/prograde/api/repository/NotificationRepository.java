package mac.prograde.api.repository;

import mac.prograde.api.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientEmailOrderByCreatedAtDesc(String email);
    long countByRecipientEmailAndIsReadFalse(String email);
    List<Notification> findByRecipientEmailAndIsReadTrue(String userEmail);
}