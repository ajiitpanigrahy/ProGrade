package mac.prograde.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;

import java.util.Map;

@Service
public class GeminiAiService {

    @Value("${gemini.api.key:none}")
    private String geminiApiKey;

    /**
     * 🌟 CACHING LOGIC:
     * 1. Checks Redis for key "ai_analysis::[submissionId]".
     * 2. If found, returns instantly (Bypasses Gemini API entirely).
     * 3. If NOT found, executes the method below.
     * 4. 'unless' ensures we DO NOT cache the fallback error messages!
     */
    @Cacheable(
        value = "ai_analysis", 
        key = "#submissionId", 
        unless = "#result.get('overallAnalysis').contains('error') || #result.get('overallAnalysis').contains('unavailable')"
    )
    @Retry(name = "geminiApi", fallbackMethod = "aiFallback")
    @CircuitBreaker(name = "geminiApi", fallbackMethod = "aiFallback")
    public Map<String, Object> generateTestAnalysis(Long submissionId, String studentPerformanceData) throws Exception {
        
        System.out.println("🤖 CACHE MISS: Calling Gemini AI for Submission ID: " + submissionId);

        if (geminiApiKey == null || geminiApiKey.isEmpty() || geminiApiKey.equals("none")) {
            return Map.of("overallAnalysis", "AI Key is missing. Please add it to application.properties.", "explanations", Map.of());
        }

        // We use gemini-1.5-flash as it handles high concurrency much better than 3.5
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=" + geminiApiKey;
        ObjectMapper mapper = new ObjectMapper();

        Map<String, Object> systemInstruction = Map.of("parts", new Object[] { Map.of("text",
                "You are a Senior Tech Lead and coding mentor. You are reviewing a junior developer's technical assessment. "
                        + "Your tone should be highly encouraging, analytical, and professional. "
                        + "You must evaluate their technology stack, pinpoint specific topics they struggled with, and provide concrete, real-world advice or mini-project ideas to help them improve. "
                        + "You must return ONLY a raw JSON object containing exactly two keys: 'overallAnalysis' (a detailed 3-paragraph string) and 'explanations' (a key-value map of specific question feedback).") });

        Map<String, Object> generationConfig = Map.of("responseMimeType", "application/json");

        Map<String, Object> requestBody = Map.of(
                "system_instruction", systemInstruction, 
                "generationConfig", generationConfig, 
                "contents", new Object[] { Map.of("parts", new Object[] { Map.of("text", studentPerformanceData) }) }
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> request = new HttpEntity<>(mapper.writeValueAsString(requestBody), headers);

        RestTemplate restTemplate = new RestTemplate();
        
        // 🚨 CRITICAL FIX: No try-catch here! 
        // We let RestTemplate throw the HTTP 503/429 Exception so Resilience4j can catch it and trigger the Circuit Breaker!
        String response = restTemplate.postForObject(url, request, String.class);

        JsonNode rootNode = mapper.readTree(response);
        String aiJsonOutput = rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

        return mapper.readValue(aiJsonOutput, Map.class);
    }
    
    // 🌟 FALLBACK METHOD 
    // Must match the EXACT parameter signature of the main method, plus the Exception!
    // Must return the exact same type (Map<String, Object>).
    public Map<String, Object> aiFallback(Long submissionId, String studentData, Exception ex) {
        System.err.println("🚨 AI CIRCUIT BREAKER TRIPPED FOR ID " + submissionId + ": " + ex.getMessage());
        
        return Map.of(
            "overallAnalysis", "The AI Analysis engine is currently experiencing heavy load or network issues (API limits). Your base score has been saved, but detailed AI insights are temporarily unavailable. Please refresh and try again in a few minutes.",
            "explanations", Map.of()
        );
    }
}