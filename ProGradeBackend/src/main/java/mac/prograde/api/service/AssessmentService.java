package mac.prograde.api.service;

import mac.prograde.api.dto.AssessmentRequestDTO;
import mac.prograde.api.entity.Assessment;
import mac.prograde.api.entity.Batch;
import mac.prograde.api.entity.BatchStudent;
import mac.prograde.api.entity.Question;
import mac.prograde.api.entity.Notification;
import mac.prograde.api.enums.NotificationType;
import mac.prograde.api.repository.AssessmentRepository;
import mac.prograde.api.repository.BatchRepository;
import mac.prograde.api.repository.BatchStudentRepository;
import mac.prograde.api.repository.QuestionRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class AssessmentService {

	@Autowired
	private AssessmentRepository assessmentRepository;
	@Autowired
	private QuestionRepository questionRepository;
	@Autowired
	private BatchRepository batchRepository;

	// 🌟 ADDED: Dependencies for triggering notifications
	@Autowired
	private BatchStudentRepository batchStudentRepository;
	@Autowired
	private NotificationService notificationService;

	@Transactional
	public Assessment createAssessment(AssessmentRequestDTO dto) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

		Assessment assessment = new Assessment();
		assessment.setTitle(dto.getTitle());
		assessment.setDescription(dto.getDescription());
		assessment.setDurationMinutes(dto.getDurationMinutes());
		assessment.setTotalQuestions(dto.getTotalQuestions());
		assessment.setPositiveMarks(dto.getPositiveMarks());
		assessment.setNegativeMarks(dto.getNegativeMarks());
		assessment.setCreationMode(Assessment.CreationMode.valueOf(dto.getCreationMode().toUpperCase()));
		assessment.setDifficultyLevel(dto.getDifficultyLevel() != null ? dto.getDifficultyLevel().toUpperCase() : "MIXED");
		assessment.setStartTime(dto.getStartTime());
		assessment.setMaxAttempts(dto.getMaxAttempts() > 0 ? dto.getMaxAttempts() : 1);

		assessment.setExamId("EXM-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
		assessment.setPassword(UUID.randomUUID().toString().substring(0, 8).toUpperCase());

		assessment.setCreatorEmail(auth.getName());
		assessment.setCreatorRole(isAdmin ? "ADMIN" : "EDUCATOR");
		assessment.setTags(dto.getTags() != null ? dto.getTags() : "General Tech");

		List<Question> finalQuestions = new ArrayList<>();

		if (assessment.getCreationMode() == Assessment.CreationMode.MANUAL) {
			finalQuestions = questionRepository.findAllById(dto.getQuestionIds());
			if (finalQuestions.size() != assessment.getTotalQuestions()) {
				throw new RuntimeException("Selected questions (" + finalQuestions.size()
						+ ") do not match configured total (" + assessment.getTotalQuestions() + ").");
			}
		} else {
            int collectedCount = 0;
            for (AssessmentRequestDTO.AutoRuleDTO rule : dto.getAutoRules()) {
                String topic = (rule.getTopic() == null || rule.getTopic().trim().equalsIgnoreCase("ALL")) ? "ALL" : rule.getTopic().trim();
                
                int theory = rule.getTheoryCount();
                int coding = rule.getCodingCount();
                
                // Fallback mapping if frontend only sends legacy 'count'
                if (theory == 0 && coding == 0 && rule.getCount() > 0) {
                    theory = rule.getCount();
                }

             // 🌟 1. FETCH THEORY MCQs
                if (theory > 0) {
                    List<Question> theoryQs = questionRepository.findRandomTheoryQuestions(
                        rule.getTechnology().toUpperCase(), topic, rule.getDifficulty().toUpperCase(), PageRequest.of(0, theory)
                    );
                    if (theoryQs.size() < theory) {
                        throw new RuntimeException("Not enough Theory questions for " + rule.getTechnology() + " -> " + topic + " (" + rule.getDifficulty() + "). Found: " + theoryQs.size());
                    }
                    finalQuestions.addAll(theoryQs);
                    collectedCount += theory;
                }

                // 🌟 2. FETCH CODING MCQs
                if (coding > 0) {
                    List<Question> codingQs = questionRepository.findRandomCodingQuestions(
                        rule.getTechnology().toUpperCase(), topic, rule.getDifficulty().toUpperCase(), PageRequest.of(0, coding)
                    );
                    if (codingQs.size() < coding) {
                        throw new RuntimeException("Not enough Coding questions for " + rule.getTechnology() + " -> " + topic + " (" + rule.getDifficulty() + "). Found: " + codingQs.size());
                    }
                    finalQuestions.addAll(codingQs);
                    collectedCount += coding;
                }
            }
            
            if (collectedCount != assessment.getTotalQuestions()) {
                throw new RuntimeException("Rule sum (" + collectedCount + ") does not match configured total (" + assessment.getTotalQuestions() + ").");
            }
        }
		
		Collections.shuffle(finalQuestions);
		assessment.setQuestions(finalQuestions);

		if (dto.getAssignedBatchIds() != null && !dto.getAssignedBatchIds().isEmpty()) {
			java.util.List<Batch> selectedBatches = batchRepository.findAllById(dto.getAssignedBatchIds());
			assessment.setAssignedBatches(new java.util.HashSet<>(selectedBatches));
		}

		Assessment savedAssessment = assessmentRepository.save(assessment);

		// 🌟 TRIGGER REAL-TIME NOTIFICATIONS TO STUDENTS 🌟
		if (savedAssessment.getAssignedBatches() != null && !savedAssessment.getAssignedBatches().isEmpty()) {
			Set<String> uniqueStudentEmails = new HashSet<>();

			// 1. Gather all unique student emails from assigned batches
			for (Batch batch : savedAssessment.getAssignedBatches()) {
				List<BatchStudent> studentsInBatch = batchStudentRepository.findAll().stream()
						.filter(bs -> bs.getBatch().getId().equals(batch.getId())).toList();

				for (BatchStudent student : studentsInBatch) {
					uniqueStudentEmails.add(student.getEmail());
				}
			}

			// 2. Broadcast a notification to every student
			for (String email : uniqueStudentEmails) {
				Notification notif = new Notification();
				notif.setRecipientEmail(email);
				notif.setSender(isAdmin ? "System Admin" : "Your Educator");
				notif.setTitle("New Assessment Assigned: " + savedAssessment.getTitle());

				String timeMsg = savedAssessment.getStartTime() != null
						? "Scheduled for: " + savedAssessment.getStartTime().toString().replace("T", " ")
						: "Available immediately.";

				notif.setMessage("You have been assigned a new assessment (" + savedAssessment.getDurationMinutes()
						+ " mins). " + timeMsg);
				notif.setType(NotificationType.INFO);
				notif.setTargetUrl("/student/dashboard?view=active-exams"); // Redirects them to the exam tab

				// Pushes to SSE and saves to DB
				notificationService.sendNotification(notif);
			}
		}

		return savedAssessment;
	}

	public List<Assessment> getAssessmentsForCurrentUser() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

		if (isAdmin) {
			return assessmentRepository.findAllByOrderByCreatedAtDesc();
		} else {
			return assessmentRepository.findByCreatorEmailOrCreatorRoleOrderByCreatedAtDesc(auth.getName(), "ADMIN");
		}
	}

	public List<Assessment> getAllAssessments() {
		return assessmentRepository.findAll();
	}

	@Transactional
	public Assessment saveAssessment(Assessment assessment) {
		return assessmentRepository.save(assessment);
	}

	@Transactional
	public void deleteAssessment(Long id) {
		assessmentRepository.deleteById(id);
	}

	@Transactional
	public Assessment toggleStatus(Long id) {
		Assessment assessment = assessmentRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Assessment not found"));
		assessment.setStatus(assessment.getStatus().equals("PUBLISHED") ? "PAUSED" : "PUBLISHED");
		return assessmentRepository.save(assessment);
	}

	@Transactional
	public Assessment postponeAssessment(Long id, java.time.LocalDateTime newStartTime) {
		Assessment assessment = assessmentRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Assessment not found"));
		assessment.setStartTime(newStartTime);
		return assessmentRepository.save(assessment);
	}

	public Assessment findByAssessmentId(Long assessmentId) {
		// TODO Auto-generated method stub
		return assessmentRepository.findById(assessmentId).get();
	}
}