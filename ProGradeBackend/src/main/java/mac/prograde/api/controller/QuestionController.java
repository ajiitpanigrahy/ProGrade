package mac.prograde.api.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import mac.prograde.api.entity.Question;
import mac.prograde.api.entity.User;
import mac.prograde.api.repository.QuestionRepository;
import mac.prograde.api.repository.UserRepository;
import mac.prograde.api.service.QuestionBulkImportService;

@RestController
@RequestMapping("/api/v1/admin/questions")
@PreAuthorize("hasAnyRole('ADMIN', 'EDUCATOR')")
public class QuestionController {

    @Autowired private QuestionBulkImportService bulkImportService;
    @Autowired private QuestionRepository questionRepository;
    
    //  ADDED: To fetch user data for single creations
    @Autowired private UserRepository userRepository; 

 // 2. Modifying deletes the RAM cache so the next request pulls fresh DB data
    @CacheEvict(value = "questions", allEntries = true)
    @SuppressWarnings("null")
	@PostMapping("/bulk-upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("error", "File exceeds 5MB size limit."));
        }

        try {
            int count = bulkImportService.importExcelData(file);
            return ResponseEntity.ok(Map.of("message",
                    "Successfully imported " + count + " questions into the platform database.", "count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    //  NEW: HISTORY ENDPOINT FOR THE LEADERBOARDßß
    @GetMapping("/history")
    public ResponseEntity<?> getContributionHistory() {
        return ResponseEntity.ok(questionRepository.getContributionHistory());
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getQuestionSummary() {
        return ResponseEntity.ok(Map.of("technologies", questionRepository.getGlobalQuestionSummary(), "topics",
                questionRepository.getGlobalTopicSummary()));
    }

    @GetMapping("")
    public ResponseEntity<Page<Question>> getQuestions(@RequestParam String technology,
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Question> result = questionRepository.findQuestionsByTechnologyAndSearch(technology.toUpperCase(), search,
                pageRequest);
        return ResponseEntity.ok(result);
    }

    @CacheEvict(value = "questions", allEntries = true)
    @SuppressWarnings("null")
	@DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long id) {
        questionRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Question deleted successfully"));
    }
    
    @CacheEvict(value = "questions", allEntries = true)
    @SuppressWarnings("null")
	@PostMapping("/create")
    public ResponseEntity<?> createQuestion(@RequestBody Question question, Authentication auth) {
        try {
            if (question.getCorrectOption() == null || !question.getCorrectOption().matches("[A-D]")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Correct option must be A, B, C, or D"));
            }

            // 🌟 EXTRACT AND INJECT UPLOADER IDENTITY FOR SINGLE QUESTIONS
            String email = auth.getName();
            String role = auth.getAuthorities().stream().findFirst().get().getAuthority().replace("ROLE_", "");
            User user = userRepository.findByEmail(email);
            String name = (user != null) ? user.getFullName() : email.split("@")[0];

            question.setCreatedByEmail(email);
            question.setCreatedByName(name);
            question.setCreatorRole(role);

            Question savedQuestion = questionRepository.save(question);
            return ResponseEntity.ok(Map.of(
                "message", "Question added successfully", 
                "question", savedQuestion
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @CacheEvict(value = "questions", allEntries = true)
    @SuppressWarnings("null")
	@PutMapping("/{id}")
    public ResponseEntity<?> updateQuestion(@PathVariable Long id, @RequestBody Question questionDetails) {
        try {
            Question existingQuestion = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id " + id));

            if (questionDetails.getCorrectOption() == null || !questionDetails.getCorrectOption().matches("[A-D]")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Correct option must be A, B, C, or D"));
            }

            // Notice we DO NOT overwrite createdByEmail or createdByName here, so the original author is preserved!
            existingQuestion.setQuestionType(questionDetails.getQuestionType()); 
            existingQuestion.setTechnology(questionDetails.getTechnology());
            existingQuestion.setDifficultyLevel(questionDetails.getDifficultyLevel());
            existingQuestion.setTopic(questionDetails.getTopic());
            existingQuestion.setQuestionText(questionDetails.getQuestionText());
            existingQuestion.setCodeSnippet(questionDetails.getCodeSnippet());
            existingQuestion.setCodeLanguage(questionDetails.getCodeLanguage());
            existingQuestion.setOptionA(questionDetails.getOptionA());
            existingQuestion.setOptionB(questionDetails.getOptionB());
            existingQuestion.setOptionC(questionDetails.getOptionC());
            existingQuestion.setOptionD(questionDetails.getOptionD());
            existingQuestion.setCorrectOption(questionDetails.getCorrectOption());

            Question updatedQuestion = questionRepository.save(existingQuestion);
            return ResponseEntity.ok(Map.of(
                "message", "Question updated successfully",
                "question", updatedQuestion
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/inventory/{tech}")
    public ResponseEntity<?> getTechInventory(@PathVariable String tech) {
        List<Object[]> rawData = questionRepository.getDetailedTopicInventoryByTech(tech);
        
        List<java.util.Map<String, Object>> inventory = rawData.stream().map(row -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("topic", row[0] != null ? row[0] : "Uncategorized");
            map.put("difficulty", row[1]);
            map.put("theoryCount", row[2] != null ? row[2] : 0);
            map.put("codingCount", row[3] != null ? row[3] : 0);
            return map;
        }).toList();
        
        return ResponseEntity.ok(inventory);
    }
}