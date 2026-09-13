package mac.prograde.api.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import mac.prograde.api.dto.ContactRequest;
import mac.prograde.api.service.ContactService;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class PublicController {

    private final ContactService contactService;

    @PostMapping("/contact")
    public ResponseEntity<?> submitContactForm(@RequestBody ContactRequest request) {
        try {
            contactService.processContactSubmission(request);
            return ResponseEntity.ok(Map.of("message", "Message sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to send message: " + e.getMessage()));
        }
    }
}