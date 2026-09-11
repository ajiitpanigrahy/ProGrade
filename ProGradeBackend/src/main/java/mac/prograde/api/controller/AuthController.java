package mac.prograde.api.controller;

import lombok.RequiredArgsConstructor;
import mac.prograde.api.dto.AuthDto;
import mac.prograde.api.entity.TokenBlacklist;
import mac.prograde.api.entity.User;
import mac.prograde.api.repository.TokenBlacklistRepository;
import mac.prograde.api.repository.UserRepository;
import mac.prograde.api.security.RateLimiterService;
import mac.prograde.api.service.AuthService;
import mac.prograde.api.service.OtpService;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final TokenBlacklistRepository tokenBlacklistRepository;
    private final OtpService otpService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RateLimiterService rateLimiter; // 🌟 Injected Rate Limiter

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthDto.RegisterRequest request, HttpServletRequest httpRequest) {
        String clientIp = httpRequest.getRemoteAddr();
        
        // Block IP if they try to create too many accounts (Spam protection)
        if (rateLimiter.isBlocked(clientIp, "REGISTER_ACTION")) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body("Too many registration attempts from this IP. Please try again later.");
        }

        try {
            AuthDto.AuthResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            rateLimiter.recordFailedAttempt(clientIp, "REGISTER_ACTION", 5, 60); // 5 attempts per hour
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Registration failed");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticate(@Valid @RequestBody AuthDto.LoginRequest request, HttpServletRequest httpRequest) {
        String clientIp = httpRequest.getRemoteAddr();
        String identifier = request.email() != null ? request.email() : "UNKNOWN";

        // 🌟 1. Check if the user/IP is locked out before hitting the DB
        if (rateLimiter.isBlocked(clientIp, identifier)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Too many failed login attempts. Account temporarily locked for 15 minutes.");
        }

        try {
            AuthDto.AuthResponse response = authService.authenticate(request);
            // 🌟 2. Reset the failure counter on a successful login
            rateLimiter.resetAttempts(clientIp, identifier);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // 🌟 3. Record the failure (Lockout after 5 fails for 15 minutes)
            rateLimiter.recordFailedAttempt(clientIp, identifier, 5, 15);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid credentials or account is pending approval.");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            TokenBlacklist blacklist = TokenBlacklist.builder().token(token)
                    .expiryDate(LocalDateTime.now().plusHours(24))
                    .build();
            tokenBlacklistRepository.save(blacklist);
        }
        return ResponseEntity.ok("Logged out successfully");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> requestOtp(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        String clientIp = httpRequest.getRemoteAddr();
        String email = request.get("email");

        // Prevent SMS/Email bombing by limiting OTP requests
        if (rateLimiter.isBlocked(clientIp, "OTP_" + email)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body("You have requested too many OTPs. Please wait 15 minutes.");
        }

        User user = userRepository.findByEmail(email);
        if (user == null) {
            // Still record the attempt to prevent brute-forcing email existence
            rateLimiter.recordFailedAttempt(clientIp, "OTP_" + email, 3, 15);
            return ResponseEntity.badRequest().body("No account found with this email address.");
        }

        otpService.generateAndLogOtp(email);
        rateLimiter.recordFailedAttempt(clientIp, "OTP_" + email, 3, 15); // Max 3 OTPs per 15 mins
        return ResponseEntity.ok("OTP generated successfully.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");

        if (!otpService.validateOtp(email, otp)) {
            return ResponseEntity.badRequest().body("Invalid or expired OTP.");
        }

        User user = userRepository.findByEmail(email);
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        otpService.clearOtp(email);
        return ResponseEntity.ok("Password reset successfully.");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName());
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return ResponseEntity.ok(new AuthDto.AuthResponse(null, 
                user.getFullName(), user.getEmail(), user.getRole(), user.isApproved(), user.getProfilePictureUrl(),
                user.getPhoneNumber(), user.getGender(), user.getHighestQualification()));
    }
}