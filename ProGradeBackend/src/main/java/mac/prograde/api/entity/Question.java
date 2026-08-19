package mac.prograde.api.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "questions")
@Data
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 254)
    private String technology;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DifficultyLevel difficultyLevel;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String questionText;

    // 🌟 NEW: Dedicated fields for Coding MCQs
    @Column(columnDefinition = "TEXT") 
    private String codeSnippet; // Stores raw multi-line code with indentation

    @Column(length = 50)
    private String codeLanguage; // e.g., "java", "python", "cpp", "javascript", "sql"

    @Column(columnDefinition = "TEXT")
    private String explanation; // Shown to students after test completion

    // 🌟 UPGRADED: Changed to TEXT so options can hold code snippets too!
    @Column(columnDefinition = "TEXT", nullable = false)
    private String optionA;
    @Column(columnDefinition = "TEXT", nullable = false)
    private String optionB;
    @Column(columnDefinition = "TEXT", nullable = false)
    private String optionC;
    @Column(columnDefinition = "TEXT", nullable = false)
    private String optionD;

    @Column(length = 5, nullable = false)
    private String correctOption; // A, B, C, or D

    @Column(length = 254)
    private String topic;
    
 // 🌟 STRICT DIFFERENTIATION COLUMN
    @Column(length = 20)
    private String questionType; // Will explicitly store "THEORY" or "CODING"

    public enum DifficultyLevel {
        EASY, MEDIUM, HARD
    }
}