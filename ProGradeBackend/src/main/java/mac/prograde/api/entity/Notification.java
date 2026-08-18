package mac.prograde.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import mac.prograde.api.enums.NotificationType;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String recipientEmail; // Who receives this?

    private String sender; // e.g., "SYSTEM", "Admin Name"
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    private NotificationType type = NotificationType.INFO;

    private String targetUrl; // Where to redirect on click
    private boolean isRead = false;
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}