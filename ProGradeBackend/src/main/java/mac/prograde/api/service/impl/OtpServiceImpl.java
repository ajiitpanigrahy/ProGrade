package mac.prograde.api.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import jakarta.mail.internet.MimeMessage;
import mac.prograde.api.service.OtpService;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpServiceImpl implements OtpService {
    
    @Autowired
    private JavaMailSender mailSender;

    // Thread-safe map to store email -> OTP
    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();

    // 🌟 RESILIENCE4J CIRCUIT BREAKER
    // If this fails (e.g., SMTP timeout), it routes to 'otpFallback'
    @Override
    @CircuitBreaker(name = "emailService", fallbackMethod = "otpFallback")
    public void generateAndLogOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStorage.put(email, otp);

        System.out.println("=================================================");
        System.out.println("🔐 OTP GENERATED FOR: " + email);
        System.out.println("🔑 YOUR OTP IS: " + otp);
        System.out.println("=================================================");

        sendOtpEmail(email, otp);
    }

    // 🌟 THE FALLBACK METHOD
    // Must have the exact same signature as the original method + an Exception parameter
    public void otpFallback(String email, Exception ex) {
        System.err.println("🚨 CIRCUIT BREAKER TRIPPED: Failed to send OTP email to " + email);
        System.err.println("🚨 REASON: " + ex.getMessage());
        
        // Even though the email failed to send, the OTP is still safely in 'otpStorage'.
        // You can read it from the backend console to continue testing!
    }

    private void sendOtpEmail(String email, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(email);
            helper.setSubject("ProGrade Security: Password Reset OTP");

            String htmlContent = """
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h2 style="color: #9333ea; font-size: 24px; margin: 0; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">ProGrade</h2>
                        <p style="color: #6b7280; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px;">Security Gateway</p>
                    </div>
                    <p style="color: #374151; font-size: 15px; line-height: 1.6;">Hello,</p>
                    <p style="color: #374151; font-size: 15px; line-height: 1.6;">We received a request to reset the password for your account. Please use the secure One-Time Password (OTP) below to proceed:</p>
                    <div style="background-color: #f3e8ff; border: 1px solid #d8b4fe; padding: 20px; border-radius: 12px; text-align: center; margin: 30px 0;">
                        <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #7e22ce;">%s</span>
                    </div>
                    <p style="color: #6b7280; font-size: 13px; line-height: 1.5; text-align: center;">This code will expire shortly. If you did not request a password reset, please ignore this email to ensure your account remains secure.</p>
                </div>
                """.formatted(otp);

            helper.setText(htmlContent, true);
            mailSender.send(message);

        } catch (Exception e) {
            // Throwing this exception triggers the Circuit Breaker fallback
            throw new RuntimeException("SMTP Communication Failure", e);
        }
    }

    @Override
    public boolean validateOtp(String email, String otp) {
        String storedOtp = otpStorage.get(email);
        return storedOtp != null && storedOtp.equals(otp);
    }

    @Override
    public void clearOtp(String email) {
        otpStorage.remove(email);
    }
}