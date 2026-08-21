package mac.prograde.api.dto;

import lombok.Data;
import java.util.List;

@Data
public class StudentPracticeRequest {
    private String title;
    private String description;
    private int durationMinutes;
    private double positiveMarks;
    private double negativeMarks;
    // We reuse the exact AutoRuleDTO from AssessmentRequestDTO
    private List<AssessmentRequestDTO.AutoRuleDTO> autoRules; 
}