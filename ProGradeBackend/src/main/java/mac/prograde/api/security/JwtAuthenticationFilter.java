package mac.prograde.api.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import mac.prograde.api.entity.User;
import mac.prograde.api.repository.TokenBlacklistRepository;
import mac.prograde.api.repository.UserRepository;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final TokenBlacklistRepository tokenBlacklistRepository;
    
    // 🌟 ADDED: We need the UserRepository to verify the user actually still exists!
    private final UserRepository userRepository; 

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);

        // Check if the token was manually logged out
        if (tokenBlacklistRepository.existsByToken(jwt)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Token has been revoked");
            return;
        }

        userEmail = jwtService.extractUsername(jwt);

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            // 🌟 THE ULTIMATE SECURITY FIX: 
            // Check the database to ensure this user hasn't been deleted or blocked!
            User dbUser = userRepository.findByEmail(userEmail);
            
            if (dbUser == null) {
                // The user was deleted from the DB! Reject the token immediately.
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("User account no longer exists in the system.");
                return;
            }

            if ("BLOCKED".equalsIgnoreCase(dbUser.getStatus()) || "SUSPENDED".equalsIgnoreCase(dbUser.getStatus())) {
                // The user was blocked! Reject the token.
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("User account has been restricted.");
                return;
            }

            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        
        filterChain.doFilter(request, response);
    }
}