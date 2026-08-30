package mac.prograde.api.service.impl;

import lombok.RequiredArgsConstructor;
import mac.prograde.api.dto.ContactRequest;
import mac.prograde.api.entity.Notification;
import mac.prograde.api.entity.User;
import mac.prograde.api.enums.NotificationType;
import mac.prograde.api.enums.Role;
import mac.prograde.api.repository.UserRepository;
import mac.prograde.api.service.ContactService;
import mac.prograde.api.service.NotificationService;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContactServiceImpl implements ContactService {

    private final JavaMailSender mailSender;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Override
    public void processContactSubmission(ContactRequest request) {
        // 1. Send Thank You Email to the User
        sendThankYouEmail(request);

        // 2. Notify all Admins internally
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            Notification notif = new Notification();
            notif.setRecipientEmail(admin.getEmail());
            notif.setSender("System Contact Form");
            notif.setTitle("New Contact Request from " + request.getFirstName());
            notif.setMessage(request.getFirstName() + " " + request.getLastName() + " (" + request.getEmail() + ") says: " + request.getMessage());
            notif.setType(NotificationType.INFO);
            notificationService.sendNotification(notif);
        }
    }

    private void sendThankYouEmail(ContactRequest request) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(request.getEmail());
            helper.setSubject("Thank you for reaching out to Pro Grade!");

            String htmlContent = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h2 style="color: #9333ea; font-size: 24px; margin: 0; font-weight: 900; text-transform: uppercase;">Pro Grade</h2>
                    </div>
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi %s,</p>
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">Thank you for contacting us! We have successfully received your message.</p>
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">Our engineering and support team will review your inquiry and get back to you as soon as possible.</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">Warm regards,</p>
                    <p style="color: #9333ea; font-size: 16px; font-weight: bold; margin-top: 5px;">The Pro Grade Team</p>
                </div>
                """.formatted(request.getFirstName());

            helper.setText(htmlContent, true);
            mailSender.send(message);

        } catch (Exception e) {
            System.err.println("Failed to send contact confirmation email to " + request.getEmail() + ": " + e.getMessage());
        }
    }
}