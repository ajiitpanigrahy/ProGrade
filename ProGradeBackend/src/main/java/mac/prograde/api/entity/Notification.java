package mac.prograde.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import mac.prograde.api.enums.NotificationType;
import com.fasterxml.jackson.annotation.JsonProperty; // 🌟 IMPORT THIS
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String recipientEmail;

    private String sender;
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(length = 50) // 🌟 FIX: Expands the column size so "ASSESSMENT_CREATED" fits!
    private NotificationType type = NotificationType.INFO;
    private String targetUrl; 
    
    // 🌟 FIX: Force JSON to keep the exact name "isRead" for React!
    @JsonProperty("isRead")
    private boolean isRead = false;
    
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}