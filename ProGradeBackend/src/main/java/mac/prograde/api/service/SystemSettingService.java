package mac.prograde.api.service;

import mac.prograde.api.entity.Notification;
import mac.prograde.api.entity.SystemSetting;
import mac.prograde.api.entity.User;
import mac.prograde.api.enums.NotificationType;
import mac.prograde.api.enums.Role;
import mac.prograde.api.repository.SystemSettingRepository;
import mac.prograde.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SystemSettingService {

    @Autowired private SystemSettingRepository repository;
    
    // 🌟 ADDED FOR NOTIFICATIONS
    @Autowired private NotificationService notificationService;
    @Autowired private UserRepository userRepository;

    public SystemSetting getGlobalSettings() {
        return repository.findById(1L).orElseGet(() -> {
            SystemSetting defaultSettings = new SystemSetting();
            return repository.save(defaultSettings);
        });
    }

    public SystemSetting updateSettings(SystemSetting newSettings) {
        SystemSetting oldSettings = getGlobalSettings();
        
        newSettings.setId(1L); // Force ID to 1 to prevent multiple rows
        SystemSetting savedSettings = repository.save(newSettings);

        // 🌟 SMART NOTIFICATION: Check if Maintenance Mode was toggled
        if (oldSettings.isMaintenanceMode() != savedSettings.isMaintenanceMode()) {
            String state = savedSettings.isMaintenanceMode() ? "ACTIVATED" : "DEACTIVATED";
            NotificationType type = savedSettings.isMaintenanceMode() ? NotificationType.WARNING : NotificationType.SUCCESS;
            
            broadcastToAdmins(
                "Maintenance Mode " + state, 
                "System maintenance mode has been " + state.toLowerCase() + ". " + (savedSettings.isMaintenanceMode() ? "Student traffic is currently blocked." : "Normal operations have resumed."), 
                type
            );
        } else {
            // General settings update alert
            broadcastToAdmins(
                "System Config Updated", 
                "Global platform configurations have been modified by an administrator.", 
                NotificationType.INFO
            );
        }

        return savedSettings;
    }

    // 🌟 Helper to broadcast to all Admins
    private void broadcastToAdmins(String title, String message, NotificationType type) {
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            Notification notif = new Notification();
            notif.setRecipientEmail(admin.getEmail());
            notif.setSender("System Config");
            notif.setTitle(title);
            notif.setMessage(message);
            notif.setType(type);
            notif.setTargetUrl("/admin/dashboard?view=settings");
            notificationService.sendNotification(notif);
        }
    }
}