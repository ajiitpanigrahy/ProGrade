package mac.prograde.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "assessments")
@Data
public class Assessment {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(unique = true, nullable = false, updatable = false)
	private String examId; // 🌟 System Generated

	@Column(nullable = false, updatable = false)
	private String password; // 🌟 System Generated

	@Column(nullable = false, updatable = false)
	private String creatorEmail; // 🌟 Tracks who built it

	@Column(nullable = false)
	private String title;

	@Column(columnDefinition = "TEXT")
	private String description;

	private int durationMinutes;
	private int totalQuestions; // 🌟 Added Total Questions
	private double positiveMarks = 1.0;
	private double negativeMarks = 0.25;

	@Enumerated(EnumType.STRING)
	private CreationMode creationMode;

	private java.time.LocalDateTime startTime; // If null, exam is always open
	private int maxAttempts = 1; // Default to 1 attempt per student
    @Column(nullable = false, updatable = false)
    private String creatorRole = "ADMIN";
	@JsonIgnore // 🌟 Prevents massive payload sizes when listing assessments
	@ManyToMany(fetch = FetchType.LAZY)
	@JoinTable(name = "assessment_questions", joinColumns = @JoinColumn(name = "assessment_id"), inverseJoinColumns = @JoinColumn(name = "question_id"))
	private List<Question> questions;

	private String status = "PUBLISHED";
	private LocalDateTime createdAt = LocalDateTime.now();

	public enum CreationMode {
		MANUAL, AUTOMATIC
	}
}