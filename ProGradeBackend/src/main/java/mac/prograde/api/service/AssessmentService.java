package mac.prograde.api.service;

import mac.prograde.api.dto.AssessmentRequestDTO;
import mac.prograde.api.entity.Assessment;
import mac.prograde.api.entity.Question;
import mac.prograde.api.repository.AssessmentRepository;
import mac.prograde.api.repository.QuestionRepository;

import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class AssessmentService {

	@Autowired
	private AssessmentRepository assessmentRepository;

	@Autowired
	private QuestionRepository questionRepository;

	@Transactional
	public Assessment createAssessment(AssessmentRequestDTO dto) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // 🌟 Check if current user is Admin
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

		Assessment assessment = new Assessment();
		assessment.setTitle(dto.getTitle());
		assessment.setDescription(dto.getDescription());
		assessment.setDurationMinutes(dto.getDurationMinutes());
		assessment.setTotalQuestions(dto.getTotalQuestions());
		assessment.setPositiveMarks(dto.getPositiveMarks());
		assessment.setNegativeMarks(dto.getNegativeMarks());
		assessment.setCreationMode(Assessment.CreationMode.valueOf(dto.getCreationMode().toUpperCase()));
		
		assessment.setStartTime(dto.getStartTime());
		assessment.setMaxAttempts(dto.getMaxAttempts() > 0 ? dto.getMaxAttempts() : 1);
		
		assessment.setExamId("EXM-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
		assessment.setPassword(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
		
        // 🌟 Track Creator Info
        assessment.setCreatorEmail(auth.getName()); 
        assessment.setCreatorRole(isAdmin ? "ADMIN" : "EDUCATOR"); 

		List<Question> finalQuestions = new ArrayList<>();

		if (assessment.getCreationMode() == Assessment.CreationMode.MANUAL) {
			assessment.setTags(dto.getTags() != null ? dto.getTags() : "General Tech");
			finalQuestions = questionRepository.findAllById(dto.getQuestionIds());
			if (finalQuestions.size() != assessment.getTotalQuestions()) {
				throw new RuntimeException("Selected questions (" + finalQuestions.size()
						+ ") do not match configured total (" + assessment.getTotalQuestions() + ").");
			}
		} else {
			assessment.setTags(dto.getTags() != null ? dto.getTags() : "General Tech");
			int collectedCount = 0;
			for (AssessmentRequestDTO.AutoRuleDTO rule : dto.getAutoRules()) {
				List<Question> randomQuestions = questionRepository.findRandomQuestions(
						rule.getTechnology().toUpperCase(), rule.getDifficulty().toUpperCase(),
						PageRequest.of(0, rule.getCount()));

				if (randomQuestions.size() < rule.getCount()) {
					throw new RuntimeException("Not enough bank questions for " + rule.getTechnology() + " ("
							+ rule.getDifficulty() + ").");
				}
				finalQuestions.addAll(randomQuestions);
				collectedCount += rule.getCount();
			}
			if (collectedCount != assessment.getTotalQuestions()) {
				throw new RuntimeException("Rule sum (" + collectedCount + ") does not match configured total ("
						+ assessment.getTotalQuestions() + ").");
			}
		}

		assessment.setQuestions(finalQuestions);
		return assessmentRepository.save(assessment);
	}

	// 🌟 Role-Based Fetching
	public List<Assessment> getAssessmentsForCurrentUser() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

		if (isAdmin) {
			return assessmentRepository.findAllByOrderByCreatedAtDesc(); // Admin sees ALL
		} else {
            // 🌟 Educator sees THEIR exams + ADMIN exams
			return assessmentRepository.findByCreatorEmailOrCreatorRoleOrderByCreatedAtDesc(auth.getName(), "ADMIN"); 
		}
	}

	public @Nullable Object getAllAssessments() {
		return assessmentRepository.findAll();
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
}