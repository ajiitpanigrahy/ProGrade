package mac.prograde.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

@Service
public class GeminiAiService {

	@Value("${gemini.api.key:none}")
	private String geminiApiKey;

	public Map<String, Object> generateTestAnalysis(String studentPerformanceData) {
		if (geminiApiKey == null || geminiApiKey.isEmpty() || geminiApiKey.equals("none")) {
			return Map.of("overallAnalysis", "⚠️ Gemini AI Key is missing. Please add it to application.properties.",
					"explanations", Map.of());
		}

		try {
			// Note: Updated model to the highly reliable 1.5-flash (or you can use your
			// custom version)
			String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=" + geminiApiKey;
			ObjectMapper mapper = new ObjectMapper();

			// 🌟 1. DEFINE THE MENTOR PERSONA (System Instruction)
			Map<String, Object> systemInstruction = Map.of("parts", new Object[] { Map.of("text",
					"You are a Senior Tech Lead and coding mentor. You are reviewing a junior developer's technical assessment. "
							+ "Your tone should be highly encouraging, analytical, and professional. "
							+ "You must evaluate their technology stack, pinpoint specific topics they struggled with, and provide concrete, real-world advice or mini-project ideas to help them improve. "
							+ "You must return ONLY a raw JSON object containing exactly two keys: 'overallAnalysis' (a detailed 3-paragraph string) and 'explanations' (a key-value map of specific question feedback).") });

			// 🌟 2. DEFINE NATIVE JSON MODE (Generation Config)
			Map<String, Object> generationConfig = Map.of("responseMimeType", "application/json" // Forces pure JSON, no
																									// markdown
																									// backticks needed!
			);

			// 🌟 3. ASSEMBLE THE PAYLOAD
			Map<String, Object> requestBody = Map.of("system_instruction", systemInstruction, "generationConfig",
					generationConfig, "contents",
					new Object[] { Map.of("parts", new Object[] { Map.of("text", studentPerformanceData) }) });

			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_JSON);
			HttpEntity<String> request = new HttpEntity<>(mapper.writeValueAsString(requestBody), headers);

			RestTemplate restTemplate = new RestTemplate();
			String response = restTemplate.postForObject(url, request, String.class);

			JsonNode rootNode = mapper.readTree(response);

			// Because we used responseMimeType="application/json", this string is already
			// 100% clean JSON
			String aiJsonOutput = rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text")
					.asText();

			return mapper.readValue(aiJsonOutput, Map.class);

		} catch (HttpClientErrorException e) {
			if (e.getStatusCode().value() == 429) {
				System.out.println("⚠️ Gemini API Rate Limit Hit!");
				return Map.of("overallAnalysis",
						"⏳ Gemini AI free tier daily quota exceeded. The AI Mentor is currently resting! Please try again later.",
						"explanations", Map.of());
			}
			e.printStackTrace();
			return Map.of("overallAnalysis", "⚠️ AI Analysis temporarily unavailable due to a model access issue.",
					"explanations", Map.of());
		} catch (Exception e) {
			e.printStackTrace();
			return Map.of("overallAnalysis", "⚠️ An unexpected error occurred while communicating with the AI Engine.",
					"explanations", Map.of());
		}
	}
}