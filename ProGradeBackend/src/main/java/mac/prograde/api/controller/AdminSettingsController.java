package mac.prograde.api.controller;

import mac.prograde.api.entity.SystemSetting;
import mac.prograde.api.service.SystemSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/settings")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSettingsController {

    @Autowired
    private SystemSettingService settingsService;

    @GetMapping
    public ResponseEntity<SystemSetting> getSettings() {
        return ResponseEntity.ok(settingsService.getGlobalSettings());
    }

    @PutMapping
    public ResponseEntity<SystemSetting> saveSettings(@RequestBody SystemSetting settings) {
        return ResponseEntity.ok(settingsService.updateSettings(settings));
    }
}