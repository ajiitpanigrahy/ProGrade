package mac.prograde.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

@Service
public class GeminiAiService {

    @Value("${gemini.api.key:none}")
    private String geminiApiKey;

    public Map<String, Object> generateTestAnalysis(String prompt) {
        if (geminiApiKey == null || geminiApiKey.isEmpty() || geminiApiKey.equals("none")) {
            return Map.of(
                "overallAnalysis", "⚠️ Gemini AI Key is missing. Please add it to application.properties.",
                "explanations", Map.of()
            );
        }

        try {
            // 🌟 FIXED: Google officially sunset the 1.5 series. Using the current, active 'gemini-3.5-flash' model!
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=" + geminiApiKey;

            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                    Map.of("parts", new Object[]{
                        Map.of("text", prompt)
                    })
                }
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> request = new HttpEntity<>(mapper.writeValueAsString(requestBody), headers);

            RestTemplate restTemplate = new RestTemplate();
            String response = restTemplate.postForObject(url, request, String.class);

            JsonNode rootNode = mapper.readTree(response);
            String aiText = rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

            // Clean up Gemini's markdown formatting
            aiText = aiText.replace("```json", "").replace("```", "").trim();

            return mapper.readValue(aiText, Map.class);
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of(
                "overallAnalysis", "AI Analysis temporarily unavailable. Check API Key permissions or network connection.",
                "explanations", Map.of()
            );
        }
    }
}