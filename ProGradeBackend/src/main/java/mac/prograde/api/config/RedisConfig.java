package mac.prograde.api.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableCaching
public class RedisConfig {

    /**
     * Customized Jackson serializer supporting Java 8 Dates (LocalDateTime),
     * UUIDs, and polymorphic type typing for clean JSON in Upstash.
     */
    private GenericJackson2JsonRedisSerializer createJsonSerializer() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule()); // Fixes LocalDateTime / LocalDate serialization
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        mapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY
        );
        return new GenericJackson2JsonRedisSerializer(mapper);
    }

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        GenericJackson2JsonRedisSerializer jsonSerializer = createJsonSerializer();

        // 1. BASE CONFIGURATION (Applied by default to unspecified caches)
        RedisCacheConfiguration baseConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofHours(1)) // Safe default fallback
                .disableCachingNullValues()
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jsonSerializer));

        // 2. PER-CACHE TTLs (Fine-grained cache lifecycles)
        Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();

        // Fast-changing data: automatically expire every 30 seconds
        cacheConfigs.put("adminMetrics", baseConfig.entryTtl(Duration.ofSeconds(30)));
        cacheConfigs.put("adminCharts", baseConfig.entryTtl(Duration.ofSeconds(30)));
        cacheConfigs.put("systemLogs", baseConfig.entryTtl(Duration.ofSeconds(30)));

        // User sessions / authentication lookups: expire after 10 minutes
        cacheConfigs.put("users", baseConfig.entryTtl(Duration.ofMinutes(10)));

        // Semi-static data: refreshed on write, auto-evicted after 6 hours
        cacheConfigs.put("questions", baseConfig.entryTtl(Duration.ofHours(6)));
        cacheConfigs.put("adminReports", baseConfig.entryTtl(Duration.ofMinutes(5)));
        cacheConfigs.put("myReports", baseConfig.entryTtl(Duration.ofMinutes(5)));

        // Heavy / cold data: retain for 14 days
        cacheConfigs.put("aiReviews", baseConfig.entryTtl(Duration.ofDays(14)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(baseConfig)
                .withInitialCacheConfigurations(cacheConfigs)
                .build();
    }

    /**
     * General-purpose RedisTemplate for chat, notifications, or manual key-value operations.
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        GenericJackson2JsonRedisSerializer jsonSerializer = createJsonSerializer();
        StringRedisSerializer stringSerializer = new StringRedisSerializer();

        // Key & HashKey serialized as plain strings
        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);

        // Value & HashValue serialized as readable JSON
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);

        template.afterPropertiesSet();
        return template;
    }
}