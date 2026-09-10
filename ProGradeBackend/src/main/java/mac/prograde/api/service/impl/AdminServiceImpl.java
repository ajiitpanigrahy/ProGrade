package mac.prograde.api.service.impl;

import lombok.RequiredArgsConstructor;
import mac.prograde.api.dto.AdminDto;
import mac.prograde.api.entity.Assessment;
import mac.prograde.api.entity.AssessmentSubmission;
import mac.prograde.api.entity.BatchStudent;
import mac.prograde.api.entity.Notification;
import mac.prograde.api.entity.User;
import mac.prograde.api.enums.Role;
import mac.prograde.api.repository.AssessmentRepository;
import mac.prograde.api.repository.BatchRepository;
import mac.prograde.api.repository.BatchStudentRepository;
import mac.prograde.api.repository.MalpracticeLogRepository;
import mac.prograde.api.repository.UserRepository;
import mac.prograde.api.repository.AssessmentSubmissionRepository;
import mac.prograde.api.repository.QuestionRepository; // 🌟 Added QuestionRepository Import
import mac.prograde.api.service.AdminService;
import mac.prograde.api.service.NotificationService;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

	private final UserRepository userRepository;
	private final AssessmentRepository assessmentRepository;
	private final MalpracticeLogRepository malpracticeLogRepository;
	private final BatchRepository batchRepository;
	private final BatchStudentRepository batchStudentRepository;
	private final AssessmentSubmissionRepository submissionRepository;
	private final QuestionRepository questionRepository;
	private final NotificationService notificationService;

	@Override
	public AdminDto.DashboardMetrics getKpiMetrics() {
	    long studentCount = userRepository.countByRole(Role.STUDENT);
	    long educatorCount = userRepository.countByRole(Role.EDUCATOR);
	    
	    return new AdminDto.DashboardMetrics(
	        (int) (studentCount * 0.12), 
	        "4,250", 
	        assessmentRepository.count(), 
	        18400,
	        malpracticeLogRepository.count(), 
	        studentCount + educatorCount, 
	        studentCount, 
	        educatorCount, 
	        12
	    );
	}

	@Override
	public AdminDto.DashboardCharts getChartData() {
		return new AdminDto.DashboardCharts(List.of(), List.of());
	}

	@Override
	public List<AdminDto.StudentDTO> getAllStudents() {
		Map<String, String> emailToBatches = batchStudentRepository.findAll().stream().collect(Collectors.groupingBy(
				BatchStudent::getEmail, Collectors.mapping(bs -> bs.getBatch().getName(), Collectors.joining(", "))));

		return userRepository.findByRole(Role.STUDENT).stream().map(user -> {
			String dbStatus = user.getStatus();
			if (dbStatus == null || dbStatus.trim().isEmpty()) {
				dbStatus = "ACTIVE";
			}

			return new AdminDto.StudentDTO(user.getId(), user.getRollNumber(), user.getFullName(), user.getEmail(),
					emailToBatches.getOrDefault(user.getEmail(), "Unassigned"), dbStatus.toUpperCase(),
					user.getCreatedAt());
		}).collect(Collectors.toList());
	}

	@Override
	public void toggleStudentStatus(UUID id) {
		User user = userRepository.findById(id).orElseThrow();
		user.setStatus("BLOCKED".equals(user.getStatus()) ? "ACTIVE" : "BLOCKED");
		userRepository.save(user);
	}

	@Override
	public void deleteStudent(UUID id) {
		User user = userRepository.findById(id).orElseThrow();
		user.setStatus("DELETED");
		userRepository.save(user);
	}

	@Override
	public void deleteBatch(UUID batchId) {
		List<BatchStudent> studentsInBatch = batchStudentRepository.findAll().stream()
				.filter(bs -> bs.getBatch().getId().equals(batchId)).collect(Collectors.toList());
		batchStudentRepository.deleteAll(studentsInBatch);
		batchRepository.deleteById(batchId);
	}

	@Override
	public void removeStudentFromBatch(UUID id) {
		batchStudentRepository.deleteById(id);
	}

	@Override
	public List<AdminDto.BatchInfoDTO> getBatchDetails() {
		java.util.Set<String> registeredEmails = userRepository.findByRole(Role.STUDENT).stream().map(User::getEmail)
				.collect(Collectors.toSet());

		return batchRepository.findAll().stream().map(batch -> {
			List<AdminDto.BatchStudentDTO> students = batchStudentRepository.findAll().stream()
					.filter(bs -> bs.getBatch().getId().equals(batch.getId()))
					.map(bs -> new AdminDto.BatchStudentDTO(bs.getId(), bs.getRollNumber(), bs.getName(), bs.getEmail(),
							registeredEmails.contains(bs.getEmail())))
					.collect(Collectors.toList());

			return new AdminDto.BatchInfoDTO(batch.getId(), batch.getName(), students.size(), students,
					batch.getCreatedAt());
		}).collect(Collectors.toList());
	}

	@Override
	public AdminDto.OverallAnalytics getOverallAnalytics() {
		long students = userRepository.findByRole(Role.STUDENT).size();
		List<AssessmentSubmission> allSubs = submissionRepository.findAll();

		long totalExamsTaken = allSubs.size();
		double avgScore = allSubs.stream().mapToDouble(AssessmentSubmission::getTotalScore).average().orElse(0.0);

		long b1 = allSubs.stream().filter(s -> s.getTotalScore() <= 20).count();
		long b2 = allSubs.stream().filter(s -> s.getTotalScore() > 20 && s.getTotalScore() <= 40).count();
		long b3 = allSubs.stream().filter(s -> s.getTotalScore() > 40 && s.getTotalScore() <= 60).count();
		long b4 = allSubs.stream().filter(s -> s.getTotalScore() > 60 && s.getTotalScore() <= 80).count();
		long b5 = allSubs.stream().filter(s -> s.getTotalScore() > 80).count();

		List<Map<String, Object>> curve = List.of(Map.of("scoreRange", "0-20 Points", "count", b1),
				Map.of("scoreRange", "21-40 Points", "count", b2), Map.of("scoreRange", "41-60 Points", "count", b3),
				Map.of("scoreRange", "61-80 Points", "count", b4), Map.of("scoreRange", "81+ Points", "count", b5));

		long passed = allSubs.stream().filter(s -> s.getTotalScore() >= 60).count();
		long failed = totalExamsTaken - passed;

		List<Map<String, Object>> passFail = List.of(
				Map.of("name", "Passed (>=60)", "value", passed, "color", "#10b981"),
				Map.of("name", "Failed (<60)", "value", failed, "color", "#ef4444"));

		return new AdminDto.OverallAnalytics(students, Math.round(avgScore * 100.0) / 100.0, totalExamsTaken, curve,
				passFail);
	}

	@Override
	public AdminDto.StudentWiseAnalytics getStudentAnalytics(UUID studentId) {
		User s = userRepository.findById(studentId).orElseThrow();
		List<AssessmentSubmission> studentSubs = submissionRepository.findAll().stream()
				.filter(sub -> sub.getStudentEmail().equals(s.getEmail())).collect(Collectors.toList());

		long attempts = studentSubs.size();
		double avg = studentSubs.stream().mapToDouble(AssessmentSubmission::getTotalScore).average().orElse(0.0);
		double highest = studentSubs.stream().mapToDouble(AssessmentSubmission::getTotalScore).max().orElse(0.0);

		List<Map<String, Object>> recentScores = studentSubs.stream().map(sub -> {
			String title = assessmentRepository.findById(sub.getAssessmentId()).map(Assessment::getTitle)
					.orElse("Exam ID: " + sub.getAssessmentId());
			Map<String, Object> map = new HashMap<>();
			map.put("examName", title);
			map.put("score", sub.getTotalScore());
			return map;
		}).collect(Collectors.toList());

		return new AdminDto.StudentWiseAnalytics(s.getFullName(), attempts, Math.round(avg * 100.0) / 100.0, highest,
				recentScores);
	}

	@Override
	public AdminDto.ExamWiseAnalytics getExamAnalytics(Long examId) {
		Assessment exam = assessmentRepository.findById(examId).orElseThrow();
		List<AssessmentSubmission> examSubs = submissionRepository.findByAssessmentIdOrderByTotalScoreDesc(examId);

		long participants = examSubs.size();
		double avg = examSubs.stream().mapToDouble(AssessmentSubmission::getTotalScore).average().orElse(0.0);
		double highest = examSubs.stream().mapToDouble(AssessmentSubmission::getTotalScore).max().orElse(0.0);

		long b1 = examSubs.stream().filter(s -> s.getTotalScore() <= 20).count();
		long b2 = examSubs.stream().filter(s -> s.getTotalScore() > 20 && s.getTotalScore() <= 40).count();
		long b3 = examSubs.stream().filter(s -> s.getTotalScore() > 40 && s.getTotalScore() <= 60).count();
		long b4 = examSubs.stream().filter(s -> s.getTotalScore() > 60 && s.getTotalScore() <= 80).count();
		long b5 = examSubs.stream().filter(s -> s.getTotalScore() > 80).count();

		List<Map<String, Object>> curve = List.of(Map.of("scoreRange", "0-20", "count", b1),
				Map.of("scoreRange", "21-40", "count", b2), Map.of("scoreRange", "41-60", "count", b3),
				Map.of("scoreRange", "61-80", "count", b4), Map.of("scoreRange", "81+", "count", b5));

		return new AdminDto.ExamWiseAnalytics(exam.getTitle(), participants, Math.round(avg * 100.0) / 100.0, highest,
				curve);
	}

	@Override
	public List<AdminDto.GlobalFraudLogDTO> getGlobalFraudLogs() {
		return malpracticeLogRepository.findAll().stream().map(log -> {
			String examName = assessmentRepository.findById(log.getAssessmentId()).map(Assessment::getTitle)
					.orElse("Unknown Exam");

			User user = userRepository.findByEmail(log.getStudentEmail());
			String studentName = (user != null) ? user.getFullName() : log.getStudentEmail().split("@")[0];

			return new AdminDto.GlobalFraudLogDTO(log.getId(), examName, studentName, log.getStudentEmail(),
					log.getInfractionType(), log.getDetails(), log.getTimestamp());
		}).sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp())).collect(Collectors.toList());
	}

	@Override
	public Map<String, Object> getAdvancedAssessmentReport(Long id) {
		List<Map<String, Object>> submissions = submissionRepository.findByAssessmentIdOrderByTotalScoreDesc(id)
				.stream().map(s -> {
					User u = userRepository.findByEmail(s.getStudentEmail());
					int safeTime = s.getTimeTaken() != null ? s.getTimeTaken() : 0;
					if (safeTime == 0 && s.getStartedAt() != null && s.getSubmittedAt() != null) {
						safeTime = (int) java.time.Duration.between(s.getStartedAt(), s.getSubmittedAt()).getSeconds();
					}

					Map<String, Object> map = new HashMap<>();
					map.put("id", s.getId());
					map.put("studentName", u != null ? u.getFullName()
							: (s.getStudentName() != null ? s.getStudentName() : s.getStudentEmail().split("@")[0]));
					map.put("studentEmail", s.getStudentEmail());
					map.put("totalScore", s.getTotalScore());
					map.put("maxScore", s.getMaxScore());
					map.put("timeTaken", safeTime);
					map.put("correctCount", s.getCorrectCount());
					map.put("incorrectCount", s.getIncorrectCount());
					map.put("unattemptedCount", s.getUnattemptedCount());
					return map;
				}).collect(Collectors.toList());

		List<Map<String, Object>> fraudLogs = malpracticeLogRepository.findAll().stream()
				.filter(log -> log.getAssessmentId().equals(id)).map(log -> {
					User u = userRepository.findByEmail(log.getStudentEmail());
					Map<String, Object> map = new HashMap<>();
					map.put("id", log.getId());
					map.put("studentName", u != null ? u.getFullName() : log.getStudentEmail());
					map.put("studentEmail", log.getStudentEmail());
					map.put("infractionType", log.getInfractionType());
					map.put("details", log.getDetails());
					map.put("timestamp", log.getTimestamp());
					return map;
				}).collect(Collectors.toList());

		double avgScore = submissions.stream().mapToDouble(s -> (Double) s.get("totalScore")).average().orElse(0.0);

		Map<String, Object> result = new HashMap<>();
		result.put("submissions", submissions);
		result.put("fraudLogs", fraudLogs);
		result.put("averageScore", Math.round(avgScore * 100.0) / 100.0);
		return result;
	}

	@Override
    public List<Map<String, Object>> getQuestionAvailability(String tech) {
        // 🌟 1. Call the updated repository method
        List<Object[]> results = questionRepository.getDetailedTopicInventoryByTech(tech);
        
        return results.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            
            // row[0] = Topic
            map.put("topic", row[0] != null && !row[0].toString().trim().isEmpty() ? row[0].toString() : "Uncategorized");
            
            // row[1] = Difficulty
            map.put("difficulty", row[1] != null ? row[1].toString().toUpperCase() : "MEDIUM");
            
            // row[2] = Theory Count
            long theoryCount = row[2] != null ? ((Number) row[2]).longValue() : 0L;
            map.put("theoryCount", theoryCount);
            
            // row[3] = Coding Count
            long codingCount = row[3] != null ? ((Number) row[3]).longValue() : 0L;
            map.put("codingCount", codingCount);
            
            // 🌟 Fallback for backward compatibility just in case
            map.put("count", theoryCount + codingCount);
            
            return map;
        }).collect(Collectors.toList());
    }
    
 // 🌟 1. UPDATE THE MAIN EDUCATOR FETCHER
    @Override
    public List<AdminDto.EducatorDTO> getAllEducators() {
        return userRepository.findByRole(Role.EDUCATOR).stream()
            .map(u -> {
                int mockCount = (int) (Math.random() * 150) + 10; 
                
                // 🌟 THE FIX: 'isApproved' is now the ultimate source of truth
                String currentStatus = u.getStatus();
                
                if (!u.isApproved()) {
                    // If not approved, they are PENDING (unless explicitly REJECTED)
                    currentStatus = "REJECTED".equalsIgnoreCase(currentStatus) ? "REJECTED" : "PENDING";
                } else {
                    // If approved, but status is empty/null or still stuck on PENDING, force it to ACTIVE
                    if (currentStatus == null || currentStatus.trim().isEmpty() || "PENDING".equalsIgnoreCase(currentStatus)) {
                        currentStatus = "ACTIVE";
                    }
                }
                
                return new AdminDto.EducatorDTO(
                    u.getId(), u.getFullName(), u.getEmail(), 
                    currentStatus.toUpperCase(), 
                    mockCount, u.getCreatedAt()
                );
            })
            .sorted((a, b) -> b.joinedAt().compareTo(a.joinedAt()))
            .collect(Collectors.toList());
    }

    // 🌟 2. UPDATE THE APPROVAL LOGIC
    @Override
    public void approveEducator(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        
        // 🌟 THE FIX: Set the dedicated boolean flag to TRUE
        user.setApproved(true); 
        user.setStatus("ACTIVE");
        userRepository.save(user);

        // Trigger Notification
        Notification notif = new Notification();
        notif.setRecipientEmail(user.getEmail());
        notif.setSender("System Admin");
        notif.setTitle("Account Approved! 🎉");
        notif.setMessage("Your Educator account has been fully verified and activated. You can now start creating assessments.");
        notif.setType(mac.prograde.api.enums.NotificationType.SUCCESS);
        notif.setTargetUrl("/educator/dashboard");
        notificationService.sendNotification(notif);
    }

    // 🌟 3. UPDATE THE REJECTION LOGIC
    @Override
    public void rejectEducator(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        
        // 🌟 THE FIX: Ensure boolean flag remains FALSE
        user.setApproved(false); 
        user.setStatus("REJECTED");
        userRepository.save(user);

        // Trigger Notification
        Notification notif = new Notification();
        notif.setRecipientEmail(user.getEmail());
        notif.setSender("System Admin");
        notif.setTitle("Account Application Rejected");
        notif.setMessage("Unfortunately, your request for an Educator account could not be verified at this time.");
        notif.setType(mac.prograde.api.enums.NotificationType.CRITICAL);
        notificationService.sendNotification(notif);
    }

    // 🌟 4. UPDATE THE PENDING WIDGET FETCHER
    @Override
    public List<AdminDto.PendingEducator> getPendingEducators() {
        return userRepository.findByRole(Role.EDUCATOR).stream()
            // 🌟 THE FIX: Only fetch users where isApproved is false AND they haven't been rejected yet
            .filter(u -> !u.isApproved() && !"REJECTED".equalsIgnoreCase(u.getStatus()))
            .map(u -> new AdminDto.PendingEducator(u.getId(), u.getFullName(), u.getEmail(), u.getCreatedAt()))
            .collect(Collectors.toList());
    }

    @Override
    public void toggleEducatorStatus(UUID id) {
        User user = userRepository.findById(id).orElseThrow();
        boolean isCurrentlyActive = "ACTIVE".equalsIgnoreCase(user.getStatus());
        
        user.setStatus(isCurrentlyActive ? "SUSPENDED" : "ACTIVE");
        userRepository.save(user);

        // 🌟 REAL-TIME NOTIFICATION TO THE EDUCATOR
        Notification notif = new Notification();
        notif.setRecipientEmail(user.getEmail());
        notif.setSender("System Security");
        
        if (isCurrentlyActive) {
            notif.setTitle("Account Suspended ⚠️");
            notif.setMessage("Your Educator account has been suspended by the Administration. Platform access is restricted.");
            notif.setType(mac.prograde.api.enums.NotificationType.CRITICAL);
            notif.setTitle("Account Reactivated 🎉");
            notif.setMessage("Your Educator account has been restored. You now have full access to the platform.");
            notif.setType(mac.prograde.api.enums.NotificationType.SUCCESS);
        }
        notificationService.sendNotification(notif);
    }
}