package mac.prograde.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import mac.prograde.api.enums.Role;

/**
 * Authentication Request and Response Records
 */
public class AuthDto {

        // Request body for /api/v1/auth/register
        public record RegisterRequest(
                        String fullName,
                        String email,
                        String password,
                        Role role) {
        }

        // Request body for /api/v1/auth/login
        public record LoginRequest(
                        @NotBlank(message = "Email cannot be empty") @Email(message = "Please provide a valid email address") String email,
                        @NotBlank(message = "Password cannot be empty") @Size(min = 8, max = 64, message = "Password must be between 8 and 64 characters") String password) {
        }

        // Response body returned upon successful authentication
        public record AuthResponse(
                        String token,
                        String fullName,
                        String email,
                        Role role,
                        boolean isApproved,
                        String profilePictureUrl,
                        String phoneNumber,
                        String gender,
                        String highestQualification) {
        }
}