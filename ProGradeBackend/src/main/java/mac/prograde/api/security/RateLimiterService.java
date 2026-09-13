package mac.prograde.api.security;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimiterService {

    // Replaces Redis: Thread-safe, lightning-fast in-memory storage
    private final Map<String, AttemptRecord> cache = new ConcurrentHashMap<>();

    public boolean isBlocked(String clientIp, String actionIdentifier) {
        String key = generateKey(clientIp, actionIdentifier);
        AttemptRecord record = cache.get(key);

        if (record == null) {
            return false; // No previous failures
        }

        // Replaces Redis TTL: If the lockout time has passed, clear the record and allow access
        if (Instant.now().isAfter(record.expiryTime)) {
            cache.remove(key);
            return false;
        }

        // Return true if they have hit or exceeded the max limit
        return record.attempts >= record.maxAttempts;
    }

    public void recordFailedAttempt(String clientIp, String actionIdentifier, int maxAttempts, int lockoutMinutes) {
        String key = generateKey(clientIp, actionIdentifier);
        
        // Fetch existing record, or create a new one starting at 0
        AttemptRecord record = cache.getOrDefault(key, new AttemptRecord(0, maxAttempts, Instant.now()));

        // Increment attempts and push the expiration clock forward
        record.attempts += 1;
        record.expiryTime = Instant.now().plusSeconds(lockoutMinutes * 60L);
        
        cache.put(key, record);
    }

    public void resetAttempts(String clientIp, String actionIdentifier) {
        cache.remove(generateKey(clientIp, actionIdentifier));
    }

    private String generateKey(String clientIp, String actionIdentifier) {
        return clientIp + ":" + actionIdentifier.toLowerCase().trim();
    }

    // Helper class to store the attempt count and expiration timestamp together
    private static class AttemptRecord {
        int attempts;
        int maxAttempts;
        Instant expiryTime;

        AttemptRecord(int attempts, int maxAttempts, Instant expiryTime) {
            this.attempts = attempts;
            this.maxAttempts = maxAttempts;
            this.expiryTime = expiryTime;
        }
    }
}