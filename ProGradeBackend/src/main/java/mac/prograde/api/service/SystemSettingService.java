package mac.prograde.api.service;

import mac.prograde.api.entity.SystemSetting;
import mac.prograde.api.repository.SystemSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SystemSettingService {

    @Autowired
    private SystemSettingRepository repository;

    public SystemSetting getGlobalSettings() {
        return repository.findById(1L).orElseGet(() -> {
            SystemSetting defaultSettings = new SystemSetting();
            return repository.save(defaultSettings);
        });
    }

    public SystemSetting updateSettings(SystemSetting newSettings) {
        newSettings.setId(1L); // Force ID to 1 to prevent multiple rows
        return repository.save(newSettings);
    }
}