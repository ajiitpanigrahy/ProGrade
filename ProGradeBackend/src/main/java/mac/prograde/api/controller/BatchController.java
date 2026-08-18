package mac.prograde.api.controller;

import mac.prograde.api.repository.BatchRepository;
import mac.prograde.api.service.BatchUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/batches")
public class BatchController {
    
    @Autowired private BatchUploadService batchUploadService;
    @Autowired private BatchRepository batchRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EDUCATOR')")
    public ResponseEntity<?> getAllBatches() {
        return ResponseEntity.ok(batchRepository.findAll());
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadStudentRoster(@RequestParam("file") MultipartFile file) {
        try {
            String result = batchUploadService.processBatchExcel(file);
            return ResponseEntity.ok(Map.of("message", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Excel Parsing Failed: " + e.getMessage()));
        }
    }
}