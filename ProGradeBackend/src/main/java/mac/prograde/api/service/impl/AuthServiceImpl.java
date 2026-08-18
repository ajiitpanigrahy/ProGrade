package mac.prograde.api.service.impl;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import mac.prograde.api.dto.AuthDto;
import mac.prograde.api.entity.Notification;
import mac.prograde.api.entity.SystemSetting;
import mac.prograde.api.entity.User;
import mac.prograde.api.enums.NotificationType;
import mac.prograde.api.enums.Role;
import mac.prograde.api.repository.UserRepository;
import mac.prograde.api.security.JwtService;
import mac.prograde.api.service.AuthService;
import mac.prograde.api.service.NotificationService;
import mac.prograde.api.service.SystemSettingService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final SystemSettingService systemSettingService;
    private final NotificationService notificationService; // 🌟 ADDED

    @Override
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {

        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("User with this email already exists");
        }

        boolean isApproved = request.role() == Role.STUDENT;

        User user = User.builder()
                .fullName(request.fullName())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(request.role())
                .isApproved(isApproved)
                .status("ACTIVE") 
                .build();

        userRepository.save(user);

        // 🌟 NOTIFICATION LOGIC
        if (request.role() == Role.STUDENT) {
            Notification notif = new Notification();
            notif.setRecipientEmail(user.getEmail());
            notif.setSender("System");
            notif.setTitle("Welcome to Pro Grade! 🚀");
            notif.setMessage("Your student account is active. Check the 'Active Examinations' tab for any assigned tests.");
            notif.setType(NotificationType.SUCCESS);
            notificationService.sendNotification(notif);
        } else if (request.role() == Role.EDUCATOR) {
            // Alert all admins about the pending educator
            List<User> admins = userRepository.findByRole(Role.ADMIN);
            for (User admin : admins) {
                Notification notif = new Notification();
                notif.setRecipientEmail(admin.getEmail());
                notif.setSender("System Security");
                notif.setTitle("New Educator Registration");
                notif.setMessage(user.getFullName() + " (" + user.getEmail() + ") has registered and is awaiting account approval.");
                notif.setType(NotificationType.INFO);
                notif.setTargetUrl("/admin/dashboard?view=educator-management");
                notificationService.sendNotification(notif);
            }
        }

        String jwtToken = jwtService.generateToken(user);

        return new AuthDto.AuthResponse(jwtToken, user.getFullName(), user.getEmail(), user.getRole(),
                user.isApproved(), user.getProfilePictureUrl(), user.getPhoneNumber(), user.getGender(),
                user.getHighestQualification());
    }

    @Override
    public AuthDto.AuthResponse authenticate(AuthDto.LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        User user = userRepository.findByEmail(request.email());

        if (user == null) throw new IllegalArgumentException("Invalid email or password");

        SystemSetting settings = systemSettingService.getGlobalSettings();
        if (settings.isMaintenanceMode()) {
            boolean isAdmin = user.getRole().name().equals("ADMIN"); 
            if (!isAdmin || !settings.isAdminBypass()) {
                throw new LockedException("MAINTENANCE_MODE: " + settings.getMaintenanceMessage());
            }
        }

        if (user.getRole().name().equals("EDUCATOR") && !user.isApproved()) {
            throw new DisabledException("ACCOUNT PENDING VERIFICATION");
        }
        if ("BLOCKED".equalsIgnoreCase(user.getStatus()) || "SUSPENDED".equalsIgnoreCase(user.getStatus())) {
            throw new LockedException("ACCOUNT RESTRICTED: Contact Administration.");
        }

        String jwtToken = jwtService.generateToken(user);

        return new AuthDto.AuthResponse(jwtToken, user.getFullName(), user.getEmail(), user.getRole(),
                user.isApproved(), user.getProfilePictureUrl(), user.getPhoneNumber(), user.getGender(),
                user.getHighestQualification());
    }
}