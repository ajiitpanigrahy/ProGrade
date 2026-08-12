package mac.prograde.api.dto;

import java.util.List;

import lombok.Data;

@Data
public class AssessmentRequestDTO {
	private String title;
	private String description;
	private int durationMinutes;
	private double positiveMarks;
	private double negativeMarks;
	private String creationMode; // "MANUAL" or "AUTOMATIC"
	private int totalQuestions; // 🌟 Add this field
	// For Manual Mode
	private List<Long> questionIds;
    private String tags; 
	// For Automatic Mode
	private List<AutoRuleDTO> autoRules;
	// Add these fields
    private java.time.LocalDateTime startTime;
    private int maxAttempts;

	@Data
	public static class AutoRuleDTO {
		private String technology;
		private String difficulty;
		private int count;
	}
}