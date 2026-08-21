package mac.prograde.api.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import mac.prograde.api.entity.User;
import mac.prograde.api.enums.Role;
import mac.prograde.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Value("${frontend.url:http://localhost:1112}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        
        // 🌟 1. Extract Details Safely
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture"); // Google picture

        // GitHub Fallbacks
        if (email == null) {
            String login = oAuth2User.getAttribute("login");
            email = login + "@github-user.com"; 
        }
        if (name == null) name = oAuth2User.getAttribute("login");
        if (picture == null) picture = oAuth2User.getAttribute("avatar_url"); // GitHub picture

        // 🌟 2. Read the Requested Role from the Frontend Cookie
        Role requestedRole = Role.STUDENT; // Default
        boolean isApproved = true;

        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("OAUTH_ROLE".equals(cookie.getName())) {
                    if ("EDUCATOR".equalsIgnoreCase(cookie.getValue())) {
                        requestedRole = Role.EDUCATOR;
                        isApproved = false; // Educators must be approved by Admin
                    }
                    break;
                }
            }
        }

        // 🌟 3. Create or Update User
        User user = userRepository.findByEmail(email);
        if (user == null) {
            user = User.builder()
                    .email(email)
                    .fullName(name)
                    .profilePictureUrl(picture)
                    .role(requestedRole)
                    .isApproved(isApproved)
                    .status("ACTIVE")
                    .password("") // Blank password for OAuth
                    .build();
            userRepository.save(user);
        } else {
            // Failsafe: If an existing user has a missing name, update it from Google!
            if (user.getFullName() == null || user.getFullName().isEmpty()) {
                user.setFullName(name);
                user.setProfilePictureUrl(picture);
                userRepository.save(user);
            }
        }

        // 🌟 4. Clear the temporary cookie for security
        Cookie clearCookie = new Cookie("OAUTH_ROLE", null);
        clearCookie.setPath("/");
        clearCookie.setMaxAge(0);
        response.addCookie(clearCookie);

        // 🌟 5. Generate JWT and Redirect
        String token = jwtService.generateToken(user);
        getRedirectStrategy().sendRedirect(request, response, frontendUrl + "/oauth/callback?token=" + token);
    }
}