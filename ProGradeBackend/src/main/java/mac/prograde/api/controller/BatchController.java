package mac.prograde.api.controller;

import mac.prograde.api.repository.BatchRepository;
import mac.prograde.api.security.RateLimiterService;
import mac.prograde.api.service.BatchUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/batches")
public class BatchController {
    
    @Autowired private BatchUploadService batchUploadService;
    @Autowired private BatchRepository batchRepository;
    @Autowired private RateLimiterService rateLimiter;

    @Cacheable(value = "allBatches")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EDUCATOR')")
    public ResponseEntity<?> getAllBatches() {
        return ResponseEntity.ok(batchRepository.findAll());
    }

    @CacheEvict(value = "allBatches", allEntries = true)
    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadStudentRoster(@RequestParam("file") MultipartFile file, HttpServletRequest request) {
        String clientIp = request.getRemoteAddr();
        
        // 🌟 RATE LIMIT: Excel processing locks threads. Max 2 uploads per minute.
        if (rateLimiter.isBlocked(clientIp, "EXCEL_UPLOAD")) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(Map.of("error", "Upload system busy. Please wait 60 seconds."));
        }
        rateLimiter.recordFailedAttempt(clientIp, "EXCEL_UPLOAD", 2, 1);

        try {
            String result = batchUploadService.processBatchExcel(file);
            return ResponseEntity.ok(Map.of("message", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Excel Parsing Failed: " + e.getMessage()));
        }
    }
}