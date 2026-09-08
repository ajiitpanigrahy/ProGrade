package mac.prograde.api.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.RequiredArgsConstructor;
import mac.prograde.api.security.JwtAuthenticationFilter;
import mac.prograde.api.security.OAuth2LoginSuccessHandler;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oAuth2LoginSuccessHandler))
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                // FIX 1: Allow CORS preflight requests to pass through
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                // FIX 2: Allow Spring's internal error router to resolve without hitting the JWT filter again
                .requestMatchers("/error").permitAll()
                
                .requestMatchers("/api/v1/public/**").permitAll() 
                .requestMatchers("/api/v1/profile/images/**").permitAll()
                .requestMatchers("/api/v1/assessments/**").hasAnyRole("ADMIN", "EDUCATOR")
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/admin/**").hasAnyRole("ADMIN", "EDUCATOR")
                .requestMatchers("/api/v1/educator/**").hasAnyRole("EDUCATOR", "ADMIN")
                .requestMatchers("/api/v1/student/**").hasAnyRole("STUDENT", "ADMIN")
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

     // 🌟 Explicitly list exact domains to guarantee CORS passes, with valid wildcards for previews
        configuration.setAllowedOriginPatterns(List.of(
            "http://localhost:1112",
            "http://localhost:5173",
            "http://localhost:3000",
            "https://prograde-rho.vercel.app", // Your exact production Vercel URL
            "https://*.vercel.app"             // Kept safely for Vercel preview branch deployments
        ));

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        
        //  Allow all request headers (prevents issues with SSE, Content-Type, Authorization, etc.)
        configuration.setAllowedHeaders(List.of("*"));
        
        //  Expose headers so the frontend can read pagination or authorization headers if sent
        configuration.setExposedHeaders(List.of("Authorization", "Content-Disposition"));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}