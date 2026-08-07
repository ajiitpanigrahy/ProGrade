package mac.prograde.api.service;

import mac.prograde.api.dto.AuthDto;

/**
 * Interface defining the contract for authentication operations.
 * Using an interface decouples the controller from the implementation,
 * making the code easier to test and maintain.
 */
public interface AuthService {

    /**
     * Registers a new user in the system.
     *
     * @param request the registration details (name, email, password, role)
     * @return AuthResponse containing the JWT token and user details
     */
    AuthDto.AuthResponse register(AuthDto.RegisterRequest request);

    /**
     * Authenticates an existing user.
     *
     * @param request the login credentials (email, password)
     * @return AuthResponse containing the JWT token and user details
     */
    AuthDto.AuthResponse authenticate(AuthDto.LoginRequest request);
}