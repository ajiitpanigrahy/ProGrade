package mac.prograde.api.controller;

import lombok.RequiredArgsConstructor;
import mac.prograde.api.dto.AuthDto;
import mac.prograde.api.entity.TokenBlacklist;
import mac.prograde.api.repository.TokenBlacklistRepository;
import mac.prograde.api.service.AuthService;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

/**
 * REST Controller exposing authentication endpoints to the frontend.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService ;
    private final TokenBlacklistRepository tokenBlacklistRepository;

    /**
     * Endpoint to register a new user.
     * Route: POST /api/v1/auth/register
     */
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
     * Endpoint to authenticate an existing user and retrieve a JWT token.
     * Route: POST /api/v1/auth/login
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
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials or account is pending approval.");
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            TokenBlacklist blacklist = TokenBlacklist.builder()
                    .token(token)
                    .expiryDate(LocalDateTime.now().plusHours(24)) // Or extract exp from JWT
                    .build();
            tokenBlacklistRepository.save(blacklist);
        }
        return ResponseEntity.ok("Logged out successfully");
    }
}