package mac.prograde.api.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class RateLimiterService {

    @Autowired
    private StringRedisTemplate redisTemplate;

    public boolean isBlocked(String clientIp, String actionIdentifier) {
        String key = "rate_limit:" + clientIp + ":" + actionIdentifier.toLowerCase().trim();
        String attemptsStr = redisTemplate.opsForValue().get(key);
        // If the key doesn't exist or isn't formatted, they are not blocked
        if (attemptsStr == null || !attemptsStr.contains(":")) return false;
        
        int currentAttempts = Integer.parseInt(attemptsStr.split(":")[0]);
        int maxAttempts = Integer.parseInt(attemptsStr.split(":")[1]);
        return currentAttempts >= maxAttempts;
    }

    public void recordFailedAttempt(String clientIp, String actionIdentifier, int maxAttempts, int lockoutMinutes) {
        String key = "rate_limit:" + clientIp + ":" + actionIdentifier.toLowerCase().trim();
        
        String currentData = redisTemplate.opsForValue().get(key);
        int attempts = 1;
        
        if (currentData != null && currentData.contains(":")) {
            attempts = Integer.parseInt(currentData.split(":")[0]) + 1;
        }
        
        // Store the attempt count and the threshold together
        redisTemplate.opsForValue().set(key, attempts + ":" + maxAttempts, Duration.ofMinutes(lockoutMinutes));
    }

    public void resetAttempts(String clientIp, String actionIdentifier) {
        String key = "rate_limit:" + clientIp + ":" + actionIdentifier.toLowerCase().trim();
        redisTemplate.delete(key);
    }
}