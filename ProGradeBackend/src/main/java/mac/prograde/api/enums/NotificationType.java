package mac.prograde.api.enums;

public enum NotificationType {
    INFO, 
    SUCCESS, 
    WARNING, 
    CRITICAL, 
    REPORT,
    WELCOME,            // Login
    CHAT_MESSAGE,       // New Chat
    EXAM_ASSIGNED,      // Exam assignment
    PROMOTION,          // Admin Promotion
    ADMIN_ALERT,        // Global/Direct Admin Alerts
    ASSESSMENT_CREATED, // Assessment Creation
    FRAUD_ALERT         // Proctoring/Fraud
}