package mac.prograde.api.config;

import lombok.RequiredArgsConstructor;
import mac.prograde.api.entity.User;
import mac.prograde.api.enums.Role;
import mac.prograde.api.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class AdminSeeder {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner seedAdminAccount() {
        return args -> {
            // Check if our default admin email already exists
            String adminEmail = "admin@prograde.com";

            if (userRepository.findByEmail(adminEmail) == null) {
                User admin = User.builder()
                        .fullName("Super Admin")
                        .email(adminEmail)
                        .password(passwordEncoder.encode("Admin@123")) // Securely hashed
                        .role(Role.ADMIN)
                        .isApproved(true) // Admins are automatically approved
                        .build();

                userRepository.save(admin);
                System.out.println("✅ Default Admin account seeded successfully!");
                System.out.println("Email: " + adminEmail);
                System.out.println("Password: Admin@123");
            } else {
                System.out.println("ℹ️ Default Admin account already exists. Skipping seed.");
            }
        };
    }
}