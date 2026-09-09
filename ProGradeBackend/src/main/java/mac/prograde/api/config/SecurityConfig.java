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
            // 🌟 Explicitly link the configuration source
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) 
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
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

        configuration.setAllowedOrigins(List.of(
            "http://localhost:1112",
            "http://localhost:5173",
            "http://localhost:3000",
            "https://prograde-rho.vercel.app" 
        ));

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        
        // 🌟 CRITICAL FIX: Explicitly list headers. Browsers block "*" when credentials are true.
        configuration.setAllowedHeaders(List.of(
            "Authorization",
            "Content-Type",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers",
            "X-Requested-With"
        ));
        
        configuration.setExposedHeaders(List.of("Authorization", "Content-Disposition"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // Caches preflight requests to speed up your frontend

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}