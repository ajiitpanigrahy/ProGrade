package mac.prograde.api.controller;

import mac.prograde.api.entity.Notification;
import mac.prograde.api.enums.NotificationType;
import mac.prograde.api.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@PreAuthorize("isAuthenticated()") // Any logged-in user can get their notifications
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(Authentication auth) {
        return notificationService.subscribe(auth.getName());
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(Authentication auth) {
        return ResponseEntity.ok(notificationService.getUserNotifications(auth.getName()));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, Authentication auth) {
        notificationService.markAsRead(id, auth.getName());
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(Authentication auth) {
        notificationService.markAllAsRead(auth.getName());
        return ResponseEntity.ok(Map.of("success", true));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id, Authentication auth) {
        notificationService.deleteNotification(id, auth.getName());
        return ResponseEntity.ok(Map.of("success", true));
    }

    // 🌟 TEST ENDPOINT: Call this via Postman to trigger a live toast in your browser!
    @PostMapping("/test")
    public ResponseEntity<?> triggerTestNotification(Authentication auth, @RequestParam String type) {
        Notification n = new Notification();
        n.setRecipientEmail(auth.getName());
        n.setSender("SYSTEM");
        n.setTitle("Test SSE Alert");
        n.setMessage("This is a live 3D notification triggered over Server-Sent Events!");
        n.setType(NotificationType.valueOf(type.toUpperCase()));
        notificationService.sendNotification(n);
        return ResponseEntity.ok(Map.of("success", true));
    }
    
    @PatchMapping("/{id}/unread")
    public ResponseEntity<?> markAsUnread(@PathVariable Long id) {
        notificationService.markAsUnread(id);
        return ResponseEntity.ok(Map.of("message", "Marked as unread"));
    }

    @PatchMapping("/unread-all")
    public ResponseEntity<?> markAllAsUnread(Authentication auth) {
        notificationService.markAllAsUnread(auth.getName());
        return ResponseEntity.ok(Map.of("message", "All marked as unread"));
    }
}