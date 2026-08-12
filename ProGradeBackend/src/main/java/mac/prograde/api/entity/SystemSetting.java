package mac.prograde.api.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "system_settings")
@Data
public class SystemSetting {

    @Id
    private Long id = 1L; // Always 1 for global settings

    // Card A: Maintenance
    private boolean maintenanceMode = false;
    private boolean adminBypass = true;
    private String maintenanceMessage = "System upgrade in progress. We will be back online shortly.";

    // Card B: Security
    private int jwtExpiryMinutes = 1440; // 24 hours
    private int maxConcurrentLogins = 1; // 0 = unlimited
    private int idleTimeoutMinutes = 30;

    // Card C: Assessment Rules
    private boolean globalProctoringAggression = true;
    private int maxTabSwitchesAllowed = 3;
    private boolean disableCopyPaste = true;

    // Card D: Notifications
    private String senderEmail = "noreply@prograde.com";
    private boolean alertAdminOnViolation = true;
}