package mac.prograde.api.controller;

import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice; // 🌟 Crucial Import
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import mac.prograde.api.entity.LoggingEvent;
import mac.prograde.api.repository.LoggingEventRepository;

@RestController
@RequestMapping("/api/v1/admin/logs")
@PreAuthorize("hasRole('ADMIN')")
public class AdminLogController {

    @Autowired
    private LoggingEventRepository logRepository;

    // Changed to ResponseEntity<?> to allow returning the Map instead of a Page
    @GetMapping
    public ResponseEntity<?> getSystemLogs(
            @RequestParam(defaultValue = "ALL") String level,
            @RequestParam(required = false) Long startTime,
            @RequestParam(required = false) Long endTime,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        // 🌟 SAFETY NET: Force negative pages to 0 to prevent 500 crashes
        page = Math.max(0, page);
        
        size = Math.min(size, 1000);
        Sort sort = sortDirection.equalsIgnoreCase("ASC") ? Sort.by("timestamp").ascending() : Sort.by("timestamp").descending();
        
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        
        // Properly assigning to Slice instead of Page
        Slice<LoggingEvent> logSlice = logRepository.findFilteredLogs(level, startTime, endTime, pageRequest);
        
        return ResponseEntity.ok(Map.of(
            "content", logSlice.getContent(),
            "hasNext", logSlice.hasNext(),
            "currentPage", page
        ));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearLogs(@RequestParam(defaultValue = "ALL") String duration) {
        long threshold = 0;
        long now = System.currentTimeMillis();
        long dayInMillis = 24L * 60 * 60 * 1000;

        switch (duration) {
            case "30D": threshold = now - (30 * dayInMillis); break;
            case "15D": threshold = now - (15 * dayInMillis); break;
            case "7D":  threshold = now - (7 * dayInMillis);  break;
            case "TODAY": threshold = now - dayInMillis;      break;
            case "ALL":
            default:
                // FIX: Use maximum future timestamp to delete ALL records
                // This replaces deleteAllInBatch() to safely respect SQL Foreign Keys.
                threshold = Long.MAX_VALUE; 
                break;
        }

        // Execute in exact order: Children first, Parent last
        logRepository.deletePropertiesOlderThan(threshold);
        logRepository.deleteExceptionsOlderThan(threshold);
        logRepository.deleteLogsOlderThan(threshold);

        return ResponseEntity.ok(Map.of("message", "System telemetry successfully purged."));
    }
}