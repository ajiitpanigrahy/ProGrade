package mac.prograde.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import mac.prograde.api.entity.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientEmailOrderByCreatedAtDesc(String email);
    long countByRecipientEmailAndIsReadFalse(String email);
    List<Notification> findByRecipientEmailAndIsReadTrue(String userEmail);
}