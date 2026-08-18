package mac.prograde.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "assessment_submissions")
@Data
public class AssessmentSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long assessmentId;
    private String studentEmail;
    private String studentName;
    
    private double totalScore;
    private double maxScore;
    private int correctCount;
    private int incorrectCount;
    private int unattemptedCount;
    private int flaggedCount;

    @Column(columnDefinition = "TEXT")
    private String responseJson;
    
    private LocalDateTime submittedAt;
    private LocalDateTime startedAt;
    
    @Column(columnDefinition = "TEXT")
    private String questionTimeJson;

    // 🌟 CRITICAL FIX: Must be 'Integer' (Object) not 'int' (primitive) so it can be null-checked!
    @Column(name = "time_taken_seconds")
    private Integer timeTaken;

    @PrePersist
    protected void onCreate() {
        if (submittedAt == null) {
            submittedAt = LocalDateTime.now();
        }
    }
}