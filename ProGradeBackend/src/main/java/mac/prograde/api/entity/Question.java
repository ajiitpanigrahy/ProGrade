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

	@Column(length = 500, nullable = false)
	private String optionA;
	@Column(length = 500, nullable = false)
	private String optionB;
	@Column(length = 500, nullable = false)
	private String optionC;
	@Column(length = 500, nullable = false)
	private String optionD;

	@Column(length = 1, nullable = false)
	private String correctOption; // A, B, C, or D

	@Column(length = 254)
	private String topic;

	public enum DifficultyLevel {
		EASY, MEDIUM, HARD
	}
}