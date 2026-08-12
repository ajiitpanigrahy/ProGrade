package mac.prograde.api.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import mac.prograde.api.entity.Question;
import mac.prograde.api.repository.QuestionRepository;
import mac.prograde.api.service.QuestionBulkImportService;

@RestController
@RequestMapping("/api/v1/admin/questions")
@PreAuthorize("hasAnyRole('ADMIN', 'EDUCATOR')")
public class QuestionController {

	@Autowired
	private QuestionBulkImportService bulkImportService;
	@Autowired
	private QuestionRepository questionRepository;

	@PostMapping("/bulk-upload")
	public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
		// Enforce 5MB limit programmatically (optional if set in application.yml)
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

	// --- SUMMARIES FOR OVERVIEW TAB ---
	@GetMapping("/summary")
	public ResponseEntity<?> getQuestionSummary() {
		return ResponseEntity.ok(Map.of("technologies", questionRepository.getGlobalQuestionSummary(), "topics",
				questionRepository.getGlobalTopicSummary()));
	}

	// --- GRID DATA FETCH FOR SPECIFIC TECHNOLOGY ---
	@GetMapping("")
	public ResponseEntity<Page<Question>> getQuestions(@RequestParam String technology,
			@RequestParam(required = false, defaultValue = "") String search,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {

		PageRequest pageRequest = PageRequest.of(page, size, Sort.by("id").descending());
		Page<Question> result = questionRepository.findQuestionsByTechnologyAndSearch(technology.toUpperCase(), search,
				pageRequest);
		return ResponseEntity.ok(result);
	}

	// --- DELETE ITEM (Action Panel) ---
	@DeleteMapping("/{id}")
	public ResponseEntity<?> deleteQuestion(@PathVariable Long id) {
		questionRepository.deleteById(id);
		return ResponseEntity.ok(Map.of("message", "Question deleted successfully"));
	}
}
