package mac.prograde.api.dto;
import lombok.Data;
import java.util.List;
import java.util.UUID; // 🌟 Import UUID

@Data
public class AssessmentRequestDTO {
	private String title;
	private String description;
	private int durationMinutes;
	private double positiveMarks;
	private double negativeMarks;
	private String creationMode;
	private int totalQuestions;
	private List<Long> questionIds;
    private String tags; 
	private List<AutoRuleDTO> autoRules;
    private java.time.LocalDateTime startTime;
    private int maxAttempts;
    
    // 🌟 CHANGED: Frontend sends UUIDs, not full Java objects
    private List<UUID> assignedBatchIds; 

 // Inside AssessmentRequestDTO.java
 // Inside AssessmentRequestDTO.java
    @Data
    public static class AutoRuleDTO {
        private String technology;
        private String topic; 
        private String difficulty;
        private int count;
        private int theoryCount; // 🌟 YOU MUST ADD THIS
        private int codingCount; // 🌟 YOU MUST ADD THIS
    }
}