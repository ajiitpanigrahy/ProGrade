package mac.prograde.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class AdminDto {

	@Data
	@AllArgsConstructor
	@NoArgsConstructor
	public static class DashboardMetrics {
		private int activeStudents;
		private String requestsPerMin;
		private long liveExams;
		private long totalQuestionsServed;
		private long fraudAlerts;
		private long totalUsers;
		private long studentCount;
		private long educatorCount;
		private int growthPercentage;
	}

	@Data
	@AllArgsConstructor
	@NoArgsConstructor
	public static class DashboardCharts {
		private List<Map<String, Object>> traffic;
		private List<Map<String, Object>> affinity;
	}

	@Data
	@AllArgsConstructor
	@NoArgsConstructor
	public static class PendingEducator {
		private UUID id;
		private String fullName;
		private String email;
		private LocalDateTime createdAt;
	}

	// 🌟 FULLY SYNCED: 7 Arguments to match AdminServiceImpl
	@Data
	@AllArgsConstructor
	@NoArgsConstructor
	public static class StudentDTO {
		private UUID id;
		private String rollNumber;
		private String fullName;
		private String email;
		private String batchName;
		private String status;
		private LocalDateTime joinedAt;
	}

	// 🌟 FULLY SYNCED: 5 Arguments to track registered users
	@Data
	@AllArgsConstructor
	@NoArgsConstructor
	public static class BatchStudentDTO {
		private UUID id;
		private String rollNumber;
		private String fullName;
		private String email;
		private boolean isRegistered;
	}

	@Data
	@AllArgsConstructor
	@NoArgsConstructor
	public static class BatchInfoDTO {
		private UUID id;
		private String name;
		private long studentCount;
		private List<BatchStudentDTO> students; // Connects to the DTO above
		private LocalDateTime createdAt;
	}

	@Data
	@AllArgsConstructor
	@NoArgsConstructor
	public static class OverallAnalytics {
		private long totalStudents;
		private double platformAvgScore;
		private long totalExamsTaken;
		private List<Map<String, Object>> scoreDistribution;
		private List<Map<String, Object>> passFailRatio;
	}

	@Data
	@AllArgsConstructor
	@NoArgsConstructor
	public static class StudentWiseAnalytics {
		private String studentName;
		private long examsAttempted;
		private double averageScore;
		private double highestScore;
		private List<Map<String, Object>> recentScores;
	}

	@Data
	@AllArgsConstructor
	@NoArgsConstructor
	public static class ExamWiseAnalytics {
		private String examTitle;
		private long participants;
		private double averageScore;
		private double highestScore;
		private List<Map<String, Object>> scoreDistribution;
	}

	// 🌟 FIXED: Changed 'UUID id' to 'Long id' to match your MalpracticeLog entity
	@Data
	@AllArgsConstructor
	@NoArgsConstructor
	public static class GlobalFraudLogDTO {
		private Long id;
		private String examName;
		private String studentName;
		private String studentEmail;
		private String infractionType;
		private String details;
		private java.time.LocalDateTime timestamp;
	}

	public record EducatorDTO(UUID id, String name, String email, String status, int questionsContributed,
			java.time.LocalDateTime joinedAt) {
	}
}