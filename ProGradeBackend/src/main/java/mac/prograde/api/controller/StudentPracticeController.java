package mac.prograde.api.controller;

import lombok.RequiredArgsConstructor;
import mac.prograde.api.dto.AssessmentRequestDTO;
import mac.prograde.api.dto.StudentPracticeRequest;
import mac.prograde.api.entity.Assessment;
import mac.prograde.api.entity.Question;
import mac.prograde.api.repository.AssessmentRepository;
import mac.prograde.api.repository.QuestionRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/student/practice")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class StudentPracticeController {

    private final AssessmentRepository assessmentRepository;
    private final QuestionRepository questionRepository;

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyPracticeExams(Authentication auth) {
        List<Assessment> practiceExams = assessmentRepository.findAll().stream()
                .filter(a -> "STUDENT".equals(a.getCreatorRole()) && auth.getName().equals(a.getCreatorEmail()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(practiceExams);
    }

    @PostMapping("/generate")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> generatePracticeExam(@RequestBody StudentPracticeRequest request, Authentication auth) {
        
        try {
            // 🌟 FIX: Generate mandatory fields for the Database
            String uniqueExamId = "PRAC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            String securePassword = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

            Assessment practice = new Assessment();
            practice.setExamId(uniqueExamId);
//            practice.setPassword(securePassword); // Must not be null
            practice.setPassword("PRACTICE");
            practice.setTitle(request.getTitle());
            practice.setDescription(request.getDescription() != null ? request.getDescription() : "Self-Practice Arena Assessment");
            practice.setDurationMinutes(request.getDurationMinutes());
            practice.setPositiveMarks(request.getPositiveMarks());
            practice.setNegativeMarks(request.getNegativeMarks());
            
            List<Question> finalQuestions = new ArrayList<>();
            int collectedCount = 0;

            for (AssessmentRequestDTO.AutoRuleDTO rule : request.getAutoRules()) {
                String topic = (rule.getTopic() == null || rule.getTopic().trim().equalsIgnoreCase("ALL")) ? "ALL" : rule.getTopic().trim();
                
                int theory = rule.getTheoryCount();
                int coding = rule.getCodingCount();

                if (theory > 0) {
                    List<Question> theoryQs = questionRepository.findRandomTheoryQuestions(
                        rule.getTechnology().toUpperCase(), topic, rule.getDifficulty().toUpperCase(), PageRequest.of(0, theory)
                    );
                    if (theoryQs.size() < theory) {
                        return ResponseEntity.badRequest().body("Not enough Theory questions for " + rule.getTechnology() + " -> " + topic + ". Requested: " + theory + ", Available: " + theoryQs.size());
                    }
                    finalQuestions.addAll(theoryQs);
                    collectedCount += theory;
                }

                if (coding > 0) {
                    List<Question> codingQs = questionRepository.findRandomCodingQuestions(
                        rule.getTechnology().toUpperCase(), topic, rule.getDifficulty().toUpperCase(), PageRequest.of(0, coding)
                    );
                    if (codingQs.size() < coding) {
                        return ResponseEntity.badRequest().body("Not enough Coding questions for " + rule.getTechnology() + " -> " + topic + ". Requested: " + coding + ", Available: " + codingQs.size());
                    }
                    finalQuestions.addAll(codingQs);
                    collectedCount += coding;
                }
            }

            practice.setQuestions(finalQuestions);
            practice.setTotalQuestions(collectedCount);
            
            practice.setCreatorEmail(auth.getName());
            practice.setCreatorRole("STUDENT");
            practice.setCreationMode(Assessment.CreationMode.AUTOMATIC); 
            practice.setStatus("PUBLISHED"); 
            practice.setMaxAttempts(999); 
            practice.setStartTime(LocalDateTime.now()); // 🌟 FIX: Must not be null
            practice.setCreatedAt(LocalDateTime.now());

            String tags = request.getAutoRules().stream()
                    .map(AssessmentRequestDTO.AutoRuleDTO::getTechnology)
                    .distinct()
                    .collect(Collectors.joining(","));
            practice.setTags(tags.isEmpty() ? "Mixed Tech" : tags);

            // 🌟 FIX: Now safely captures DB save errors!
            Assessment savedPractice = assessmentRepository.save(practice); 
            return ResponseEntity.ok(savedPractice);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Database Save Error: " + e.getMessage());
        }
    }

    @GetMapping("/inventory/{tech}")
    @PreAuthorize("hasRole('STUDENT')")
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