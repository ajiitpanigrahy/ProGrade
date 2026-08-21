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
	@Column(name = "tags")
	private String tags; //
	private java.time.LocalDateTime startTime; // If null, exam is always open
	private Integer maxAttempts; // Default to 1 attempt per student
	@Column(nullable = false, updatable = false)
	private String creatorRole = "ADMIN";
	@JsonIgnore // 🌟 Prevents massive payload sizes when listing assessments
	@ManyToMany(fetch = FetchType.LAZY)
	@JoinTable(name = "assessment_questions", joinColumns = @JoinColumn(name = "assessment_id"), inverseJoinColumns = @JoinColumn(name = "question_id"))
	private List<Question> questions;
	
	// Add this to your Assessment entity
    @Column(length = 20)
    private String difficultyLevel;

	private String status = "PUBLISHED";
	private LocalDateTime createdAt = LocalDateTime.now();

	// Add this field to your Assessment class
	@Column(name = "allowed_educators", columnDefinition = "TEXT")
	private String allowedEducators; // Will store comma-separated emails: "edu1@mail.com, edu2@mail.com"

	// Inside Assessment.java
	@ManyToMany(fetch = FetchType.LAZY)
	@JoinTable(name = "assessment_batch", joinColumns = @JoinColumn(name = "assessment_id"), inverseJoinColumns = @JoinColumn(name = "batch_id"))
	private java.util.Set<Batch> assignedBatches = new java.util.HashSet<>();

	public java.util.Set<Batch> getAssignedBatches() {
		return assignedBatches;
	}

	public void setAssignedBatches(java.util.Set<Batch> assignedBatches) {
		this.assignedBatches = assignedBatches;
	}

	// Make sure you have getters and setters for it!
	public String getAllowedEducators() {
		return allowedEducators;
	}

	public void setAllowedEducators(String allowedEducators) {
		this.allowedEducators = allowedEducators;
	}

	public enum CreationMode {
		MANUAL, AUTOMATIC
	}
}