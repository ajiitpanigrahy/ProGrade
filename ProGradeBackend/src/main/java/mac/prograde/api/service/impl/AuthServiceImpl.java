package mac.prograde.api.service.impl;

import lombok.RequiredArgsConstructor;

import mac.prograde.api.dto.AuthDto;
import mac.prograde.api.entity.User;
import mac.prograde.api.enums.Role;
import mac.prograde.api.repository.UserRepository;
import mac.prograde.api.security.JwtService;
import mac.prograde.api.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Core business logic for User Authentication and Registration.
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	private final AuthenticationManager authenticationManager;

	@Override
	public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {

		// 1. Check if email is already taken to prevent duplicates
		if (userRepository.existsByEmail(request.email())) {
			throw new IllegalArgumentException("User with this email already exists");
		}

		// 2. Determine approval status based on the role
		// Students are instantly approved. Educators need admin verification.
		boolean isApproved = request.role() == Role.STUDENT;

		// 3. Build the User entity using the builder pattern
		User user = User.builder().fullName(request.fullName()).email(request.email())
				.password(passwordEncoder.encode(request.password())) // Hash the password securely!
				.role(request.role()).isApproved(isApproved).build();

		// 4. Save the new user to the database
		userRepository.save(user);

		// 5. Generate a JWT Token for the newly registered user
		String jwtToken = jwtService.generateToken(user);

		// 6. Return the response payload
		return new AuthDto.AuthResponse(jwtToken, user.getFullName(), user.getEmail(), user.getRole(),
				user.isApproved());
	}

	@Override
	public AuthDto.AuthResponse authenticate(AuthDto.LoginRequest request) {

		// 1. Authenticate user credentials via Spring Security
		// This automatically throws an exception if the password doesn't match
		// or if the account is disabled (e.g., an unapproved Educator)
		authenticationManager
				.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));

		// 2. Fetch the user from the database
		User user = userRepository.findByEmail(request.email());

		if (user == null) {
			throw new IllegalArgumentException("Invalid email or password");
		}

		// 3. Generate a new JWT token for the session
		String jwtToken = jwtService.generateToken(user);

		// 4. Return the response payload
		return new AuthDto.AuthResponse(jwtToken, user.getFullName(), user.getEmail(), user.getRole(),
				user.isApproved());
	}
}