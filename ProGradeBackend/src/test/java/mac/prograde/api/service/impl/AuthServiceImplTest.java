package mac.prograde.api.service.impl;

import mac.prograde.api.dto.AuthDto;
import mac.prograde.api.entity.SystemSetting;
import mac.prograde.api.entity.User;
import mac.prograde.api.enums.Role;
import mac.prograde.api.repository.UserRepository;
import mac.prograde.api.security.JwtService;
import mac.prograde.api.service.NotificationService;
import mac.prograde.api.service.SystemSettingService;
import mac.prograde.api.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private SystemSettingService systemSettingService;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private AuthServiceImpl authService;

    private User studentUser;
    private User educatorUser;
    private SystemSetting defaultSettings;

    @BeforeEach
    void setUp() {
        studentUser = User.builder()
                .email("student@test.com")
                .role(Role.STUDENT)
                .isApproved(true)
                .status("ACTIVE")
                .build();

        educatorUser = User.builder()
                .email("educator@test.com")
                .role(Role.EDUCATOR)
                .isApproved(false) // Pending by default
                .status("PENDING")
                .build();

        defaultSettings = new SystemSetting();
        defaultSettings.setMaintenanceMode(false);
    }

    @Test
    void testRegister_StudentIsAutoApproved() {
        AuthDto.RegisterRequest req = new AuthDto.RegisterRequest("John Doe", "student@test.com", "pass", Role.STUDENT);
        
        when(userRepository.existsByEmail("student@test.com")).thenReturn(false);
        when(passwordEncoder.encode("pass")).thenReturn("encodedPass");
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt-token");

        AuthDto.AuthResponse res = authService.register(req);

        assertTrue(res.isApproved(), "Student accounts must be auto-approved upon registration.");
        verify(notificationService, times(1)).sendNotification(any());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testAuthenticate_MaintenanceMode_BlocksStudents() {
        AuthDto.LoginRequest req = new AuthDto.LoginRequest("student@test.com", "pass");
        
        defaultSettings.setMaintenanceMode(true);
        defaultSettings.setMaintenanceMessage("System upgrading");
        defaultSettings.setAdminBypass(true);

        when(userRepository.findByEmail("student@test.com")).thenReturn(studentUser);
        when(systemSettingService.getGlobalSettings()).thenReturn(defaultSettings);

        LockedException exception = assertThrows(LockedException.class, () -> authService.authenticate(req));
        assertTrue(exception.getMessage().contains("MAINTENANCE_MODE"));
    }

    @Test
    void testAuthenticate_UnapprovedEducator_ThrowsException() {
        AuthDto.LoginRequest req = new AuthDto.LoginRequest("educator@test.com", "pass");
        
        when(userRepository.findByEmail("educator@test.com")).thenReturn(educatorUser);
        when(systemSettingService.getGlobalSettings()).thenReturn(defaultSettings);

        DisabledException exception = assertThrows(DisabledException.class, () -> authService.authenticate(req));
        assertEquals("ACCOUNT PENDING VERIFICATION", exception.getMessage());
    }
}