package mac.prograde.api.dto;

import java.util.List;

import lombok.Data;

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