package mac.prograde.api.config;

import lombok.RequiredArgsConstructor;
import mac.prograde.api.entity.User;
import mac.prograde.api.enums.Role;
import mac.prograde.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class AdminSeeder {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 🚀 Injecting credentials via system environment variables
    @Value("${app.admin.email:admin@prograde.com}")
    private String adminEmail;

    @Value("${app.admin.password:Admin@DefaultFallback}")
    private String adminPassword;

    @Bean
    public CommandLineRunner seedAdminAccount() {
        return args -> {
            if (userRepository.findByEmail(adminEmail) == null) {
                User admin = User.builder()
                        .fullName("Super Admin")
                        .email(adminEmail)
                        .password(passwordEncoder.encode(adminPassword)) // Dynamic system password hashed safely
                        .role(Role.ADMIN)
                        .isApproved(true) 
                        .build();

                userRepository.save(admin);
                System.out.println("✅ Default Admin account seeded successfully!");
                System.out.println("Email: " + adminEmail);
            } else {
                System.out.println("ℹ️ Default Admin account already exists. Skipping seed.");
            }
        };
    }
}
