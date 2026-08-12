package mac.prograde.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class AssessmentSubmission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long assessmentId;
    private String studentEmail;
    
    private double totalScore;
    private double maxScore;
    private int correctCount;
    private int incorrectCount;
    private int unattemptedCount;
    private int flaggedCount;
    @Column(columnDefinition = "TEXT")
    private String responseJson;
    private LocalDateTime submittedAt;
 // 🌟 ADD THESE NEW FIELDS
    private java.time.LocalDateTime startedAt;
    @Column(columnDefinition = "TEXT")
    private String questionTimeJson;

    // (Keep your existing submittedAt and responseJson fields...)

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
    }
}