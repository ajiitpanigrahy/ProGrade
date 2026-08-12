package mac.prograde.api.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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

    @GetMapping
    public ResponseEntity<Page<LoggingEvent>> getSystemLogs(
            @RequestParam(defaultValue = "ALL") String level,
            @RequestParam(required = false) Long startTime,
            @RequestParam(required = false) Long endTime,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        Sort sort = sortDirection.equalsIgnoreCase("ASC") ? 
                Sort.by("timestamp").ascending() : Sort.by("timestamp").descending();
                
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        
        Page<LoggingEvent> logs = logRepository.findFilteredLogs(level, startTime, endTime, pageRequest);
        return ResponseEntity.ok(logs);
    }
}