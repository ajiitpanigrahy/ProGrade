package mac.prograde.api.controller;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import mac.prograde.api.entity.Assessment;
import mac.prograde.api.entity.AssessmentSubmission;
import mac.prograde.api.entity.MalpracticeLog;
import mac.prograde.api.entity.Question;
import mac.prograde.api.repository.AssessmentRepository;
import mac.prograde.api.repository.AssessmentSubmissionRepository;
import mac.prograde.api.repository.MalpracticeLogRepository;

@RestController
@RequestMapping("/api/v1/student/live-exam")
@PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
public class LiveExamController {

	@Autowired
	private AssessmentRepository assessmentRepository;

	@Autowired
	private MalpracticeLogRepository malpracticeLogRepository;

	@Autowired
	private AssessmentSubmissionRepository submissionRepository;

	@Autowired
	private mac.prograde.api.service.GeminiAiService geminiAiService;

	@GetMapping("/{assessmentId}")
	public ResponseEntity<?> getSecureExamPayload(@PathVariable Long assessmentId) {
		@SuppressWarnings("null")
		Assessment exam = assessmentRepository.findById(assessmentId)
				.orElseThrow(() -> new RuntimeException("Assessment not found."));

		List<Map<String, Object>> secureQuestions = exam.getQuestions().stream()
				.map(q -> Map.<String, Object>of(
                        "id", q.getId(), 
                        "questionText", q.getQuestionText(), 
                        "optionA", q.getOptionA(), 
                        "optionB", q.getOptionB(), 
                        "optionC", q.getOptionC(), 
                        "optionD", q.getOptionD()
                ))
				.collect(Collectors.toList());

		return ResponseEntity.ok(Map.of(
                "id", exam.getId(), 
                "title", exam.getTitle(), 
                "durationMinutes", exam.getDurationMinutes(), 
                "totalQuestions", exam.getTotalQuestions(), 
                "questions", secureQuestions
        ));
	}

	@PostMapping("/{assessmentId}/submit")
    @SuppressWarnings({ "unchecked", "null" })
    public ResponseEntity<?> submitExam(@PathVariable Long assessmentId, @RequestBody Map<String, Object> payload, Authentication auth) {
        try {
            Assessment exam = assessmentRepository.findById(assessmentId).orElseThrow();

            Map<String, String> studentAnswers = (Map<String, String>) payload.get("answers");
            if (studentAnswers == null) studentAnswers = new java.util.HashMap<>();

            String startedAtStr = (String) payload.get("startedAt");
            Map<String, Object> rawTimeSpent = (Map<String, Object>) payload.get("timeSpent");
            Map<String, Integer> timeSpentMap = new java.util.HashMap<>();

            if (rawTimeSpent != null) {
                for (Map.Entry<String, Object> entry : rawTimeSpent.entrySet()) {
                    timeSpentMap.put(entry.getKey(), Integer.parseInt(String.valueOf(entry.getValue())));
                }
            }

            int flaggedCount = payload.containsKey("flaggedCount") && payload.get("flaggedCount") != null
                    ? Integer.parseInt(String.valueOf(payload.get("flaggedCount"))) : 0;

            double posMarks = (exam.getPositiveMarks() <= 0) ? 1.0 : exam.getPositiveMarks();
            double negMarks = (exam.getNegativeMarks() <= 0) ? 0.25 : exam.getNegativeMarks();

            double totalScore = 0.0;
            int correctCount = 0;
            int incorrectCount = 0;
            int unattemptedCount = exam.getTotalQuestions() - studentAnswers.size();
            
            // 🌟 NEW: Track granular scores per technology
            Map<String, Map<String, Double>> techBreakdown = new java.util.HashMap<>();
            List<Question> questions = exam.getQuestions();

            for (int i = 0; i < questions.size(); i++) {
                Question q = questions.get(i);
                String studentChoice = studentAnswers.get(String.valueOf(i));
                
                // Extract the specific technology for this exact question
                String tech = (q.getTechnology() != null && !q.getTechnology().isBlank()) 
                        ? q.getTechnology().trim().toUpperCase() : "GENERAL";

                // Initialize tracking for this tech if it doesn't exist yet
                techBreakdown.putIfAbsent(tech, new java.util.HashMap<>(Map.of("earned", 0.0, "max", 0.0)));
                
                // Add to the Max Possible Score for this tech
                techBreakdown.get(tech).put("max", techBreakdown.get(tech).get("max") + posMarks);

                if (studentChoice != null) {
                    if (studentChoice.equals(q.getCorrectOption())) {
                        totalScore += posMarks;
                        correctCount++;
                        techBreakdown.get(tech).put("earned", techBreakdown.get(tech).get("earned") + posMarks);
                    } else {
                        totalScore -= negMarks;
                        incorrectCount++;
                        techBreakdown.get(tech).put("earned", techBreakdown.get(tech).get("earned") - negMarks);
                    }
                }
            }

            if (totalScore < 0) totalScore = 0;
            double maxScore = exam.getTotalQuestions() * posMarks;

            AssessmentSubmission submission = new AssessmentSubmission();
            submission.setAssessmentId(assessmentId);
            submission.setStudentEmail(auth.getName().trim().toLowerCase());
            submission.setTotalScore(totalScore);
            submission.setMaxScore(maxScore);
            submission.setCorrectCount(correctCount);
            submission.setIncorrectCount(incorrectCount);
            submission.setUnattemptedCount(unattemptedCount);
            submission.setFlaggedCount(flaggedCount);

            if (startedAtStr != null && !startedAtStr.isEmpty()) {
                try {
                    ZonedDateTime zdt = ZonedDateTime.parse(startedAtStr);
                    submission.setStartedAt(zdt.withZoneSameInstant(ZoneId.systemDefault()).toLocalDateTime());
                } catch (Exception ex) {
                    submission.setStartedAt(LocalDateTime.now());
                }
            } else {
                submission.setStartedAt(LocalDateTime.now());
            }

            submission.setSubmittedAt(LocalDateTime.now());

            ObjectMapper mapper = new ObjectMapper();
            try {
                submission.setResponseJson(mapper.writeValueAsString(studentAnswers));
                submission.setQuestionTimeJson(mapper.writeValueAsString(timeSpentMap));
                // 🌟 NEW: Save the precise technological breakdown to the database
                submission.setTechBreakdownJson(mapper.writeValueAsString(techBreakdown));
            } catch (Exception e) {
                submission.setResponseJson("{}");
                submission.setQuestionTimeJson("{}");
                submission.setTechBreakdownJson("{}");
            }

            AssessmentSubmission savedSubmission = submissionRepository.saveAndFlush(submission);
            return ResponseEntity.ok(Map.of("message", "Submitted successfully.", "submissionId", savedSubmission.getId()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

	@SuppressWarnings("null")
	@GetMapping("/submissions")
	public ResponseEntity<?> getMySubmissions(Authentication auth) {
		List<AssessmentSubmission> subs = submissionRepository.findByStudentEmailOrderBySubmittedAtDesc(auth.getName());
		List<Map<String, Object>> result = subs.stream().map(sub -> {
			String title = assessmentRepository.findById(sub.getAssessmentId()).map(Assessment::getTitle)
					.orElse("Assessment");
			return Map.<String, Object>of("id", sub.getId(), "examTitle", title, "score", sub.getTotalScore(),
					"maxScore", sub.getMaxScore(), "submittedAt", sub.getSubmittedAt(), "correctCount",
					sub.getCorrectCount(), "incorrectCount", sub.getIncorrectCount());
		}).collect(Collectors.toList());
		return ResponseEntity.ok(result);
	}

	@SuppressWarnings("null")
	@GetMapping("/analysis/{submissionId}")
	public ResponseEntity<?> getTestAnalysis(@PathVariable Long submissionId, Authentication auth) {
		AssessmentSubmission sub = submissionRepository.findById(submissionId).orElseThrow();
		@SuppressWarnings("null")
		Assessment exam = assessmentRepository.findById(sub.getAssessmentId()).orElseThrow();

		ObjectMapper mapper = new ObjectMapper();

		Map<String, String> tempAnswers;
		Map<String, Integer> tempTimeSpent;

		try {
			tempAnswers = mapper.readValue(sub.getResponseJson(), new TypeReference<Map<String, String>>() {
			});
			tempTimeSpent = sub.getQuestionTimeJson() != null
					? mapper.readValue(sub.getQuestionTimeJson(), new TypeReference<Map<String, Integer>>() {
					})
					: Map.of();
		} catch (Exception e) {
			tempAnswers = Map.of();
			tempTimeSpent = Map.of();
		}

		final Map<String, String> finalStudentAnswers = tempAnswers;
		final Map<String, Integer> finalTimeSpent = tempTimeSpent;

		List<Map<String, Object>> analysisDetails = new java.util.ArrayList<>();
		List<Question> questions = exam.getQuestions();

		for (int i = 0; i < questions.size(); i++) {
			Question q = questions.get(i);
			String questionIndex = String.valueOf(i);

			String studentChoice = finalStudentAnswers.get(questionIndex);
			boolean isCorrect = studentChoice != null && studentChoice.equals(q.getCorrectOption());
			Integer secondsSpent = finalTimeSpent.getOrDefault(questionIndex, 0);

			String correctOptionText = getOptionText(q, q.getCorrectOption());
			String studentOptionText = studentChoice != null ? getOptionText(q, studentChoice) : "None (Skipped)";

			Map<String, Object> detailMap = new java.util.HashMap<>();
			detailMap.put("questionText", q.getQuestionText());
            
            // 🌟 FIX: Include Developer Code Snippet Data in Analysis!
            detailMap.put("codeSnippet", q.getCodeSnippet());
            detailMap.put("codeLanguage", q.getCodeLanguage());
            detailMap.put("questionType", q.getQuestionType());
            
			detailMap.put("optionA", q.getOptionA());
			detailMap.put("optionB", q.getOptionB());
			detailMap.put("optionC", q.getOptionC());
			detailMap.put("optionD", q.getOptionD());
			detailMap.put("correctOption", q.getCorrectOption());
			detailMap.put("correctOptionText", correctOptionText);
			detailMap.put("studentOption", studentChoice == null ? "UNATTEMPTED" : studentChoice);
			detailMap.put("studentOptionText", studentOptionText);
			detailMap.put("isCorrect", isCorrect);
			detailMap.put("timeSpentSeconds", secondsSpent);

			analysisDetails.add(detailMap);
		}

		int calculatedTotalSeconds = 0;
		if (sub.getStartedAt() != null && sub.getSubmittedAt() != null) {
			calculatedTotalSeconds = (int) Duration.between(sub.getStartedAt(), sub.getSubmittedAt()).getSeconds();
		} else {
			calculatedTotalSeconds = finalTimeSpent.values().stream().mapToInt(Integer::intValue).sum();
		}

		Map<String, Object> responseMap = new java.util.HashMap<>();
		responseMap.put("examTitle", exam.getTitle());
		responseMap.put("score", sub.getTotalScore());
		responseMap.put("maxScore", sub.getMaxScore());
		responseMap.put("correct", sub.getCorrectCount());
		responseMap.put("incorrect", sub.getIncorrectCount());
		responseMap.put("skipped", sub.getUnattemptedCount());
		responseMap.put("flagged", sub.getFlaggedCount());
		responseMap.put("startedAt", sub.getStartedAt() != null ? sub.getStartedAt().toString() : "");
		responseMap.put("submittedAt", sub.getSubmittedAt() != null ? sub.getSubmittedAt().toString() : "");
		responseMap.put("totalTimeSeconds", calculatedTotalSeconds);
		responseMap.put("details", analysisDetails);

		return ResponseEntity.ok(responseMap);
	}

	private String getOptionText(Question q, String optionKey) {
		if (optionKey == null)
			return "";
		return switch (optionKey.toUpperCase()) {
		case "A" -> q.getOptionA();
		case "B" -> q.getOptionB();
		case "C" -> q.getOptionC();
		case "D" -> q.getOptionD();
		default -> "";
		};
	}

	@SuppressWarnings("null")
    @GetMapping("/analysis/{submissionId}/ai-insights")
    public ResponseEntity<?> getGeminiInsights(@PathVariable Long submissionId) {
        AssessmentSubmission sub = submissionRepository.findById(submissionId).orElseThrow();
        @SuppressWarnings("null")
        Assessment exam = assessmentRepository.findById(sub.getAssessmentId()).orElseThrow();

        StringBuilder prompt = new StringBuilder();
        prompt.append("STUDENT EXAM PERFORMANCE DATA:\n");
        prompt.append("- Exam Title: ").append(exam.getTitle()).append("\n");
        prompt.append("- Total Score: ").append(sub.getTotalScore()).append(" out of ").append(sub.getMaxScore()).append("\n");
        prompt.append("- Correct Answers: ").append(sub.getCorrectCount()).append("\n");
        prompt.append("- Incorrect Answers: ").append(sub.getIncorrectCount()).append("\n");
        prompt.append("- Skipped Questions: ").append(sub.getUnattemptedCount()).append("\n");

        // 🌟 PASS BOTH THE ID (FOR REDIS) AND THE PROMPT (FOR GEMINI)
        Map<String, Object> aiResponse;
        try {
            aiResponse = geminiAiService.generateTestAnalysis(submissionId, prompt.toString());
        } catch (Exception e) {
            // Safety net just in case JSON parsing fails after API call
            aiResponse = Map.of(
                "overallAnalysis", "An internal error occurred while parsing the AI response.",
                "explanations", Map.of()
            );
        }
        
        return ResponseEntity.ok(aiResponse);
    }

	@PostMapping("/{assessmentId}/fraud-log")
	public ResponseEntity<?> reportMalpractice(@PathVariable Long assessmentId,
			@RequestBody Map<String, String> payload, Authentication auth) {
		MalpracticeLog log = new MalpracticeLog();
		log.setAssessmentId(assessmentId);
		log.setStudentEmail(auth.getName());
		log.setInfractionType(payload.get("infraction"));
		log.setDetails(payload.get("details"));
		malpracticeLogRepository.save(log);
		return ResponseEntity.ok(Map.of("message", "Infraction securely logged."));
	}
}