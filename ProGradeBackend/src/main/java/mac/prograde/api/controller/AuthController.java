package mac.prograde.api.controller;

import lombok.RequiredArgsConstructor;
import mac.prograde.api.dto.AuthDto;
import mac.prograde.api.entity.TokenBlacklist;
import mac.prograde.api.entity.User;
import mac.prograde.api.repository.TokenBlacklistRepository;
import mac.prograde.api.repository.UserRepository;
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

/**
 * REST Controller exposing authentication endpoints to the frontend.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

	private final AuthService authService;
	private final TokenBlacklistRepository tokenBlacklistRepository;
	private final OtpService otpService;
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	/**
	 * Endpoint to register a new user. Route: POST /api/v1/auth/register
	 */
	@SuppressWarnings("null")
	@PostMapping("/register")
	public ResponseEntity<?> register(@RequestBody AuthDto.RegisterRequest request) {
		try {
			AuthDto.AuthResponse response = authService.register(request);
			// Return 201 Created on success
			return ResponseEntity.status(HttpStatus.CREATED).body(response);
		} catch (IllegalArgumentException e) {
			// Return 400 Bad Request if email already exists
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
		} catch (Exception e) {
			// Return 500 Internal Server Error for any other unexpected failures
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Registration failed");
		}
	}

	/**
	 * Endpoint to authenticate an existing user and retrieve a JWT token. Route:
	 * POST /api/v1/auth/login
	 */
	@PostMapping("/login")
	public ResponseEntity<?> authenticate(@RequestBody AuthDto.LoginRequest request) {
		try {
			AuthDto.AuthResponse response = authService.authenticate(request);
			// Return 200 OK with the token payload
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			// Catch authentication errors (wrong password, unapproved account, etc.)
			// Return 401 Unauthorized
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body("Invalid credentials or account is pending approval.");
		}
	}

	@SuppressWarnings("null")
	@PostMapping("/logout")
	public ResponseEntity<String> logout(HttpServletRequest request) {
		String authHeader = request.getHeader("Authorization");
		if (authHeader != null && authHeader.startsWith("Bearer ")) {
			String token = authHeader.substring(7);
			TokenBlacklist blacklist = TokenBlacklist.builder().token(token)
					.expiryDate(LocalDateTime.now().plusHours(24)) // Or extract exp from JWT
					.build();
			tokenBlacklistRepository.save(blacklist);
		}
		return ResponseEntity.ok("Logged out successfully");
	}

	@PostMapping("/forgot-password")
	public ResponseEntity<?> requestOtp(@RequestBody Map<String, String> request) {
		String email = request.get("email");
		User user = userRepository.findByEmail(email);

		if (user == null) {
			return ResponseEntity.badRequest().body("No account found with this email address.");
		}

		otpService.generateAndLogOtp(email);
		return ResponseEntity.ok("OTP generated successfully.");
	}

	@SuppressWarnings("null")
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

		otpService.clearOtp(email); // Clean up
		return ResponseEntity.ok("Password reset successfully.");
	}

	// ADD THIS: Used by frontend after OAuth redirect to hydrate UserContext
	@GetMapping("/me")
	public ResponseEntity<?> getCurrentUser(Authentication authentication) {
		User user = userRepository.findByEmail(authentication.getName());
		if (user == null)
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

		return ResponseEntity.ok(new AuthDto.AuthResponse(null, // Token not needed here
				user.getFullName(), user.getEmail(), user.getRole(), user.isApproved(), user.getProfilePictureUrl(),
				user.getPhoneNumber(), user.getGender(), user.getHighestQualification()));
	}
}