package mac.prograde.api.service;

import mac.prograde.api.dto.AdminDto;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface AdminService {
    AdminDto.DashboardMetrics getKpiMetrics();
    List<AdminDto.PendingEducator> getPendingEducators();
    void approveEducator(UUID userId);
    void rejectEducator(UUID userId);
    AdminDto.DashboardCharts getChartData();
    List<AdminDto.StudentDTO> getAllStudents();
    void toggleStudentStatus(UUID id);
    void deleteStudent(UUID id);
    List<AdminDto.BatchInfoDTO> getBatchDetails();
    void deleteBatch(UUID batchId);
    AdminDto.OverallAnalytics getOverallAnalytics();
    AdminDto.StudentWiseAnalytics getStudentAnalytics(UUID studentId);
    AdminDto.ExamWiseAnalytics getExamAnalytics(Long examId);
    void removeStudentFromBatch(UUID id);
    List<AdminDto.GlobalFraudLogDTO> getGlobalFraudLogs();
 // Add this with your other method definitions
    Map<String, Object> getAdvancedAssessmentReport(Long assessmentId);
    List<Map<String, Object>> getQuestionAvailability(String technology);
    List<AdminDto.EducatorDTO> getAllEducators();
    void toggleEducatorStatus(UUID id);
}