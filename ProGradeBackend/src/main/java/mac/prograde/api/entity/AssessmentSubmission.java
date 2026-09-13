package mac.prograde.api.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

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
    
    @Column(columnDefinition = "TEXT")
    private String techBreakdownJson;

    @PrePersist
    protected void onCreate() {
        if (submittedAt == null) {
            submittedAt = LocalDateTime.now();
        }
    }
}