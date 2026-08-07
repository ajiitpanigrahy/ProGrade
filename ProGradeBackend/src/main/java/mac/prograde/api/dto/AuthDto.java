package mac.prograde.api.dto;

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
            Role role
    ) {}

    // Request body for /api/v1/auth/login
    public record LoginRequest(
            String email,
            String password
    ) {}

    // Response body returned upon successful authentication
    public record AuthResponse(
            String token,
            String fullName,
            String email,
            Role role,
            boolean isApproved
    ) {}
}