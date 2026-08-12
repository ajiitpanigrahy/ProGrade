package mac.prograde.api.controller;

import mac.prograde.api.entity.SystemSetting;
import mac.prograde.api.service.SystemSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/public/system")
public class PublicSystemController {

    @Autowired
    private SystemSettingService settingsService;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSystemStatus() {
        SystemSetting settings = settingsService.getGlobalSettings();
        Map<String, Object> status = new HashMap<>();
        
        status.put("maintenanceMode", settings.isMaintenanceMode());
        status.put("message", settings.getMaintenanceMessage());
        
        return ResponseEntity.ok(status);
    }
}