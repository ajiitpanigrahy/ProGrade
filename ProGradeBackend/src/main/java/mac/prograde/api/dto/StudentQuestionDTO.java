package mac.prograde.api.dto;

import lombok.Data;

@Data
public class StudentQuestionDTO {
    private Long id;
    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    
    // Developer tags
    private String technology;
    private String topic;
    private String difficultyLevel;
    
    // 🌟 THE MISSING PIECES FOR THE UI
    private String questionType;
    private String codeSnippet;
    private String codeLanguage;
}