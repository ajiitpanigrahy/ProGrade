package mac.prograde.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import mac.prograde.api.entity.SystemSetting;
import mac.prograde.api.service.SystemSettingService;

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