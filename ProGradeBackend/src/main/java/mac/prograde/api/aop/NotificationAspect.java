package mac.prograde.api.aop;

import mac.prograde.api.entity.Assessment; // Adjust import based on your actual entity
import mac.prograde.api.entity.Notification;
import mac.prograde.api.enums.NotificationType;
import mac.prograde.api.service.NotificationService;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class NotificationAspect {

    @Autowired
    private NotificationService notificationService;

    // Helper to get current logged-in user
    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.isAuthenticated()) ? auth.getName() : null;
    }

    // 1. WELCOME NOTIFICATION (Listens for successful Login)
    // Adjust the pointcut to match your AuthController/AuthService login method
    @AfterReturning(pointcut = "execution(* mac.prograde.api.controller.AuthController.authenticateUser(..))")
    public void sendWelcomeMessage() {
        String email = getCurrentUserEmail();
        if (email != null) {
            Notification n = new Notification();
            n.setRecipientEmail(email);
            n.setSender("SYSTEM");
            n.setTitle("Welcome to ProGrade!");
            n.setMessage("We're glad to have you. Explore your dashboard to get started.");
            n.setType(NotificationType.WELCOME);
            n.setTargetUrl("/student/dashboard");
            notificationService.sendNotification(n);
        }
    }

    // 2. ASSESSMENT CREATION (Listens for a saved Assessment)
    // Adjust pointcut to your AssessmentService.createAssessment method
    @AfterReturning(pointcut = "execution(* mac.prograde.api.service.AssessmentService.createAssessment(..))", returning = "assessment")
    public void notifyAssessmentCreation(JoinPoint joinPoint, Assessment assessment) {
        String email = getCurrentUserEmail();
        Notification n = new Notification();
        n.setRecipientEmail(email);
        n.setSender("SYSTEM");
        n.setTitle("Assessment Forged Successfully️");
        n.setMessage("Your assessment '" + assessment.getTitle() + "' has been compiled and is ready.");
        n.setType(NotificationType.ASSESSMENT_CREATED);
        n.setTargetUrl("/educator/assessments/" + assessment.getId());
        notificationService.sendNotification(n);
    }

    // 3. EXAM ASSIGNED TO BATCH (Listens for batch assignment logic)
    // Assuming method takes (String batchId, Long assessmentId)
    @AfterReturning(pointcut = "execution(* mac.prograde.api.service.AssessmentService.assignToBatch(..))")
    public void notifyExamAssignment(JoinPoint joinPoint) {
        // You would typically loop through students in the batch here
        // and fire notificationService.sendNotification() for each student email.
        // Example for a single student:
        Notification n = new Notification();
        n.setSender("EDUCATOR");
        n.setTitle("New Exam Assigned");
        n.setMessage("A new assessment has been assigned to your batch. Check your Active Examinations tab.");
        n.setType(NotificationType.EXAM_ASSIGNED);
        n.setTargetUrl("/student/dashboard?view=active-exams");
        // notificationService.sendNotification(n);
    }

    // 4. FRAUD ALERT (Listens for proctoring engine flags)
    @AfterReturning(pointcut = "execution(* mac.prograde.api.service.ProctoringService.flagSuspiciousActivity(..))")
    public void triggerFraudAlert() {
        String email = getCurrentUserEmail();
        Notification n = new Notification();
        n.setRecipientEmail(email);
        n.setSender("SECURITY SHIELD");
        n.setTitle("Security Warning");
        n.setMessage("Suspicious activity was detected during your session. Multiple violations may result in exam termination.");
        n.setType(NotificationType.FRAUD_ALERT);
        notificationService.sendNotification(n);
    }
}