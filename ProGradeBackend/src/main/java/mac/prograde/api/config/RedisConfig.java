package mac.prograde.api.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

@Configuration
@EnableCaching // 🌟 Tells Spring Boot to activate @Cacheable annotations across the application
public class RedisConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        
        RedisCacheConfiguration defaultCacheConfig = RedisCacheConfiguration.defaultCacheConfig()
                // 🌟 1. TIME TO LIVE (TTL): How long should data stay in Redis?
                // We set it to 14 days. After 14 days, the AI review is deleted to save RAM.
                .entryTtl(Duration.ofDays(14)) 
                
                // 🌟 2. NULL SAFETY: Prevent caching empty/null responses if the AI fails.
                .disableCachingNullValues() 
                
                // 🌟 3. KEY SERIALIZER: How the key looks in the database
                // By default, Spring converts keys to unreadable binary (e.g., \xac\xed\x00\x05t).
                // StringRedisSerializer keeps it as plain text (e.g., "ai_analysis::101"), 
                // making it easy for you to read inside the Redis CLI terminal.
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                
                // 🌟 4. VALUE SERIALIZER: How the actual data is saved
                // GenericJackson2Json turns your Java Map<String, Object> into a clean JSON string
                // before saving it to Redis, making it incredibly fast to retrieve.
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultCacheConfig)
                .build();
    }
}