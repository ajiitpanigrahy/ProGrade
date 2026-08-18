package mac.prograde.api.service;

import mac.prograde.api.entity.Notification;
import mac.prograde.api.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    // Thread-safe map to hold live connections
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    // 🌟 1. Establish Live Connection
    public SseEmitter subscribe(String email) {
        SseEmitter emitter = new SseEmitter(60 * 60 * 1000L); // 1 hour timeout
        emitters.put(email, emitter);

        emitter.onCompletion(() -> emitters.remove(email));
        emitter.onTimeout(() -> emitters.remove(email));
        emitter.onError((e) -> emitters.remove(email));

        try {
            // Send initial connection payload
            emitter.send(SseEmitter.event().name("INIT").data("Connected Successfully"));
        } catch (Exception e) {
            emitters.remove(email);
        }

        return emitter;
    }

    // 🌟 2. Broadcast Real-Time Notification
    public void sendNotification(Notification notification) {
        // Save to Database
        Notification saved = notificationRepository.save(notification);

        // Push to client if they are currently online
        SseEmitter emitter = emitters.get(saved.getRecipientEmail());
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event().name("notification").data(saved));
            } catch (Exception e) {
                emitters.remove(saved.getRecipientEmail());
            }
        }
    }

    // 🌟 3. Standard DB Actions
    public List<Notification> getUserNotifications(String email) {
        return notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(email);
    }

    public void markAsRead(Long id, String email) {
        notificationRepository.findById(id).ifPresent(notif -> {
            if (notif.getRecipientEmail().equals(email)) {
                notif.setRead(true);
                notificationRepository.save(notif);
            }
        });
    }

    public void markAllAsRead(String email) {
        List<Notification> unread = notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(email)
                .stream().filter(n -> !n.isRead()).toList();
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public void deleteNotification(Long id, String email) {
        notificationRepository.findById(id).ifPresent(notif -> {
            if (notif.getRecipientEmail().equals(email)) notificationRepository.delete(notif);
        });
    }
    
 // 🌟 ADD THIS: Check if a user is currently online
    public boolean isUserOnline(String email) {
        return emitters.containsKey(email);
    }

    // 🌟 ADD THIS: Push raw custom events (Chat Messages, Typing, Presence)
    public void sendEvent(String email, String eventName, Object data) {
        SseEmitter emitter = emitters.get(email);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(data));
            } catch (Exception e) {
                emitters.remove(email);
            }
        }
    }
    
 // 🌟 FIX: Actively pings connections every 10 seconds. Destroys "Ghost" online statuses instantly.
    @org.springframework.scheduling.annotation.Scheduled(fixedRate = 10000)
    public void keepConnectionsAliveAndClean() {
        emitters.forEach((email, emitter) -> {
            try {
                emitter.send(org.springframework.web.servlet.mvc.method.annotation.SseEmitter.event().name("ping").data("alive"));
            } catch (Exception e) {
                emitters.remove(email); // User logged out or closed tab -> instantly marked offline!
            }
        });
    }
    
    @Transactional
    public void markAsUnread(Long id) {
        Notification notif = notificationRepository.findById(id).orElseThrow();
        notif.setRead(false);
        notificationRepository.save(notif);
    }

    @Transactional
    public void markAllAsUnread(String userEmail) {
        List<Notification> notifications = notificationRepository.findByRecipientEmailAndIsReadTrue(userEmail);
        for (Notification n : notifications) {
            n.setRead(false);
        }
        notificationRepository.saveAll(notifications);
    }
}