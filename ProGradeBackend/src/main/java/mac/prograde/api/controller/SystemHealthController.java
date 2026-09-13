package mac.prograde.api.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import mac.prograde.api.service.SystemMonitorService;

@RestController
@RequestMapping("/api/v1/admin/health")
@PreAuthorize("hasRole('ADMIN')")
public class SystemHealthController {

    @Autowired
    private SystemMonitorService monitorService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getHealthMetrics() {
        return ResponseEntity.ok(monitorService.getLiveSystemHealth());
    }

    @PostMapping("/loglevel")
    public ResponseEntity<String> updateLogLevel(@RequestParam String loggerName, @RequestParam String level) {
        monitorService.changeLogLevel(loggerName, level);
        return ResponseEntity.ok("Log level updated successfully");
    }
}