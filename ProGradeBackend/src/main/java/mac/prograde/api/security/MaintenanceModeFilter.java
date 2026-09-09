package mac.prograde.api.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import mac.prograde.api.entity.SystemSetting;
import mac.prograde.api.service.SystemSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class MaintenanceModeFilter extends OncePerRequestFilter {

    @Autowired
    private SystemSettingService settingsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String path = request.getRequestURI();

        // 1. Always allow public health checks and static images
        if (path.startsWith("/api/v1/public") || path.contains("/images/")) {
            filterChain.doFilter(request, response);
            return;
        }

        SystemSetting settings = settingsService.getGlobalSettings();
        
        if (settings == null) {
            settings = new SystemSetting(); // Safely fall back to defaults
        }

        if (settings.isMaintenanceMode()) {
            
            // 2. 🚨 BLOCK REGISTRATIONS ENTIRELY DURING MAINTENANCE
            if (path.equals("/api/v1/auth/register")) {
                response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
                response.setContentType("application/json");
                response.getWriter().write("{\"message\": \"" + settings.getMaintenanceMessage() + "\"}");
                return;
            }

            // 3. Allow login through so the Admin service check can evaluate the role
            if (path.equals("/api/v1/auth/login")) {
                filterChain.doFilter(request, response);
                return;
            }

            // 4. Standard Admin Bypass check for all other endpoints
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            boolean isAdmin = auth != null && auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            if (!isAdmin || !settings.isAdminBypass()) {
                response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
                response.setContentType("application/json");
                response.getWriter().write("{\"message\": \"" + settings.getMaintenanceMessage() + "\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}