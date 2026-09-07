package mac.prograde.api.controller;

import lombok.RequiredArgsConstructor;
import mac.prograde.api.dto.AdminDto;
import mac.prograde.api.service.AdminService;
import mac.prograde.api.service.BatchUploadService; // 🌟 Added import
import mac.prograde.api.service.StudentAssessmentService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile; // 🌟 Added import

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

	private final AdminService adminService;
	private final BatchUploadService batchUploadService; // Added Injection
	private final StudentAssessmentService studentAssessmentService;

	@GetMapping("/metrics")
	public ResponseEntity<AdminDto.DashboardMetrics> getMetrics() {
		return ResponseEntity.ok(adminService.getKpiMetrics());
	}

	@GetMapping("/charts")
	public ResponseEntity<AdminDto.DashboardCharts> getCharts() {
		return ResponseEntity.ok(adminService.getChartData());
	}

	@GetMapping("/educators/pending")
	public ResponseEntity<List<AdminDto.PendingEducator>> getPendingEducators() {
		return ResponseEntity.ok(adminService.getPendingEducators());
	}

	@PutMapping("/educators/{id}/approve")
	public ResponseEntity<String> approveEducator(@PathVariable UUID id) {
		adminService.approveEducator(id);
		return ResponseEntity.ok("Educator approved successfully");
	}

	@DeleteMapping("/educators/{id}/reject")
	public ResponseEntity<String> rejectEducator(@PathVariable UUID id) {
		adminService.rejectEducator(id);
		return ResponseEntity.ok("Educator request rejected");
	}

	@GetMapping("/students")
	public ResponseEntity<List<AdminDto.StudentDTO>> getAllStudents() {
		return ResponseEntity.ok(adminService.getAllStudents());
	}

	@PatchMapping("/students/{id}/toggle-status")
	public ResponseEntity<?> toggleStudentStatus(@PathVariable UUID id) {
		adminService.toggleStudentStatus(id);
		return ResponseEntity.ok(Map.of("message", "Student status updated."));
	}

	@DeleteMapping("/students/{id}")
	public ResponseEntity<?> deleteStudent(@PathVariable UUID id) {
		adminService.deleteStudent(id);
		return ResponseEntity.ok(Map.of("message", "Student deleted."));
	}

	@GetMapping("/batches/info")
	public ResponseEntity<List<AdminDto.BatchInfoDTO>> getBatchDetails() {
		return ResponseEntity.ok(adminService.getBatchDetails());
	}

	@DeleteMapping("/batches/{id}")
	public ResponseEntity<?> deleteBatch(@PathVariable UUID id) {
		adminService.deleteBatch(id);
		return ResponseEntity.ok(Map.of("message", "Batch deleted successfully."));
	}

	// THIS IS THE ENDPOINT THAT WAS MISSING! THIS FIXES THE LOGOUT!
	@SuppressWarnings("null")
	@PostMapping("/batches/upload")
	public ResponseEntity<?> uploadStudentRoster(@RequestParam("file") MultipartFile file) {
		try {
			String result = batchUploadService.processBatchExcel(file);
			return ResponseEntity.ok(Map.of("message", result));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(Map.of("error", "Excel Parsing Failed: " + e.getMessage()));
		}
	}

	@GetMapping("/analytics/overall")
	public ResponseEntity<AdminDto.OverallAnalytics> getOverallAnalytics() {
		return ResponseEntity.ok(adminService.getOverallAnalytics());
	}

	@GetMapping("/analytics/student/{id}")
	public ResponseEntity<AdminDto.StudentWiseAnalytics> getStudentAnalytics(@PathVariable UUID id) {
		return ResponseEntity.ok(adminService.getStudentAnalytics(id));
	}

	@GetMapping("/analytics/exam/{id}")
	public ResponseEntity<AdminDto.ExamWiseAnalytics> getExamAnalytics(@PathVariable Long id) {
		return ResponseEntity.ok(adminService.getExamAnalytics(id));
	}

	// 🌟 NEW: Unbind student from batch
	@PatchMapping("/students/{id}/unbind-batch")
	public ResponseEntity<?> unbindStudentFromBatch(@PathVariable UUID id) {
		adminService.removeStudentFromBatch(id);
		return ResponseEntity.ok(Map.of("message", "Student successfully removed from the batch."));
	}

	@GetMapping("/fraud-logs")
	public ResponseEntity<List<AdminDto.GlobalFraudLogDTO>> getGlobalFraudLogs() {
		return ResponseEntity.ok(adminService.getGlobalFraudLogs());
	}

	// This goes in AdminController.java
	@GetMapping("/assessments/{id}/advanced-report")
	public ResponseEntity<Map<String, Object>> getAdvancedAssessmentReport(@PathVariable Long id) {
		return ResponseEntity.ok(adminService.getAdvancedAssessmentReport(id));
	}

	@GetMapping("/questions/availability")
	public ResponseEntity<List<Map<String, Object>>> getQuestionAvailability(@RequestParam String technology) {
		return ResponseEntity.ok(adminService.getQuestionAvailability(technology));
	}

	@GetMapping("/educators")
	public ResponseEntity<List<AdminDto.EducatorDTO>> getAllEducators() {
		return ResponseEntity.ok(adminService.getAllEducators());
	}

	@PatchMapping("/educators/{id}/toggle-status")
	public ResponseEntity<?> toggleEducatorStatus(@PathVariable UUID id) {
		adminService.toggleEducatorStatus(id);
		return ResponseEntity.ok(Map.of("message", "Educator status updated successfully."));
	}
	
	@GetMapping("/leaderboard")
	public ResponseEntity<?> getAdminLeaderboard(@RequestParam(required = false, defaultValue = "ALL_TIME") String time) {
	    // Pass null for studentEmail so it calculates globally without highlighting a specific user
	    return ResponseEntity.ok(studentAssessmentService.getLeaderboards(null, time));
	}
}