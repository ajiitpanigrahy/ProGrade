package mac.prograde.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "system_reports")
public class SystemReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String reporterEmail;
    private String reporterRole;

    @Enumerated(EnumType.STRING)
    private ReportType type;

    @Enumerated(EnumType.STRING)
    private ReportSeverity severity;

    @Enumerated(EnumType.STRING)
    private ReportStatus status = ReportStatus.OPEN;

    @Column(columnDefinition = "TEXT")
    private String cause;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Conditional Fields for User/Chat Reports
    private String targetUserEmail;

    // Conditional Fields for Bug/Feature Reports
    private String featureName;
    private String pageUrl;
    
    @Column(columnDefinition = "TEXT")
    private String suggestions;
    
 // Add this inside mac.prograde.api.entity.SystemReport
    @Column(columnDefinition = "TEXT")
    private String adminNotes;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
    
 // Add these fields to track exact status change times
    private LocalDateTime investigatingAt;
    private LocalDateTime resolvedAt;
 // 🌟 Add this boolean to explicitly track unsatisfied users
    @Column(nullable = false)
    private boolean isReopened = false;

    public enum ReportType {
        USER_BEHAVIOR, CHAT_ABUSE, BUG_REPORT, FEATURE_REQUEST, OTHER
    }

    public enum ReportSeverity {
        LOW, MEDIUM, HIGH, IMMEDIATE
    }

    public enum ReportStatus {
        OPEN, INVESTIGATING, RESOLVED, DISMISSED
    }
}