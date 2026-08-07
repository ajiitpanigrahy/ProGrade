package mac.prograde.api.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import mac.prograde.api.repository.TokenBlacklistRepository;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Intercepts incoming requests to extract and validate the JWT token.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtService jwtService;
	private final UserDetailsService userDetailsService;
	private final TokenBlacklistRepository tokenBlacklistRepository;

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
		String path = request.getServletPath();
		// Skip the JWT filter entirely for auth endpoints
		return path.startsWith("/api/v1/auth/");
	}

	@Override
	protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
			@NonNull FilterChain filterChain) throws ServletException, IOException {

		final String authHeader = request.getHeader("Authorization");
		final String jwt;
		final String userEmail;

		// 1. Check if the Authorization header exists and starts with "Bearer "
		if (authHeader == null || !authHeader.startsWith("Bearer ")) {
			filterChain.doFilter(request, response);
			return;
		}

		// 2. Extract the token
		jwt = authHeader.substring(7);
		userEmail = jwtService.extractUsername(jwt);

		if (tokenBlacklistRepository.existsByToken(jwt)) {
		    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
		    return; // Token is revoked
		}
		
		// 3. If we have an email and the user is not already authenticated in this
		// session
		if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

			// Load user from database
			UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

			// Validate token against the database user
			if (jwtService.isTokenValid(jwt, userDetails)) {

				// Create an authentication object
				UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails,
						null, userDetails.getAuthorities());

				// Enforce the authentication details
				authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

				// Update the Security Context
				SecurityContextHolder.getContext().setAuthentication(authToken);
			}
		}

		// Continue down the filter chain
		filterChain.doFilter(request, response);
	}
}