package mac.prograde.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class MalpracticeLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long assessmentId;
    private String studentEmail;
    
    private String infractionType; // e.g., "TAB_SWITCH"
    
    @Column(columnDefinition = "TEXT")
    private String details; // e.g., "User was away for 15 seconds."
    
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}