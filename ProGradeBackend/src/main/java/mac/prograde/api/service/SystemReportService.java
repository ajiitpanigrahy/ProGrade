package mac.prograde.api.service;

import mac.prograde.api.dto.ReportRequestDTO;
import mac.prograde.api.entity.Notification;
import mac.prograde.api.entity.SystemReport;
import mac.prograde.api.enums.NotificationType;
import mac.prograde.api.repository.NotificationRepository;
import mac.prograde.api.repository.SystemReportRepository;

import org.hibernate.annotations.NotFoundAction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SystemReportService {

    @Autowired
    private SystemReportRepository reportRepository;

    @Autowired
    private NotificationRepository notificationRepository; // Assuming you have this from your existing notification system

    public Map<String, Object> submitReport(ReportRequestDTO dto, Authentication auth) {
        SystemReport report = new SystemReport();
        report.setReporterEmail(auth.getName());
        report.setReporterRole(auth.getAuthorities().iterator().next().getAuthority());
        
        report.setType(SystemReport.ReportType.valueOf(dto.getType()));
        report.setSeverity(SystemReport.ReportSeverity.valueOf(dto.getSeverity()));
        report.setCause(dto.getCause());
        report.setDescription(dto.getDescription());
        
        report.setTargetUserEmail(dto.getTargetUserEmail());
        report.setFeatureName(dto.getFeatureName());
        report.setPageUrl(dto.getPageUrl());
        report.setSuggestions(dto.getSuggestions());

        SystemReport savedReport = reportRepository.save(report);

        // 🌟 FIX: Bulletproofed the Notification to ensure no DB constraints fail
        if (report.getSeverity() == SystemReport.ReportSeverity.IMMEDIATE || report.getSeverity() == SystemReport.ReportSeverity.HIGH) {
            try {
                Notification adminAlert = new Notification();
                adminAlert.setRecipientEmail("admin@gmail.com"); // Ensure this matches an actual admin email in your DB!
                adminAlert.setSender("SYSTEM");
                adminAlert.setTitle("⚠️ " + report.getSeverity() + " Severity Report Filed");
                adminAlert.setMessage("A new " + report.getType() + " report requires attention from " + auth.getName());
                adminAlert.setType(NotificationType.REPORT);
                adminAlert.setTargetUrl("/admin/reports");
                adminAlert.setRead(false);
                adminAlert.setCreatedAt(LocalDateTime.now());
                
                notificationRepository.save(adminAlert);
            } catch (Exception e) {
                System.err.println("Failed to send admin notification for report: " + e.getMessage());
            }
        }

        return Map.of("message", "Report submitted successfully", "reportId", savedReport.getId());
    }

    public List<SystemReport> getAllReports() {
        return reportRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public void updateReportStatus(Long id, String status) {
        SystemReport report = reportRepository.findById(id).orElseThrow();
        report.setStatus(SystemReport.ReportStatus.valueOf(status.toUpperCase()));
        report.setUpdatedAt(LocalDateTime.now());
        reportRepository.save(report);
    }
    
    public List<SystemReport> getMyReports(String email) {
        return reportRepository.findByReporterEmailOrderByCreatedAtDesc(email);
    }

    public void updateReportStatus(Long id, String status, String notes) {
        SystemReport report = reportRepository.findById(id).orElseThrow();
        SystemReport.ReportStatus newStatus = SystemReport.ReportStatus.valueOf(status.toUpperCase());
        
        report.setStatus(newStatus);
        
        // 🌟 Automate status timestamps
        if (newStatus == SystemReport.ReportStatus.INVESTIGATING && report.getInvestigatingAt() == null) {
            report.setInvestigatingAt(LocalDateTime.now());
        } else if (newStatus == SystemReport.ReportStatus.RESOLVED || newStatus == SystemReport.ReportStatus.DISMISSED) {
            report.setResolvedAt(LocalDateTime.now());
        }

        if (notes != null && !notes.isEmpty()) {
            report.setAdminNotes(notes);
        }
        report.setUpdatedAt(LocalDateTime.now());
        reportRepository.save(report);
    }

    public void reopenReport(Long id, String email) {
        SystemReport report = reportRepository.findById(id).orElseThrow();
        
        if (!report.getReporterEmail().equalsIgnoreCase(email)) {
            throw new RuntimeException("Unauthorized to re-open this report.");
        }
        
        report.setStatus(SystemReport.ReportStatus.OPEN);
        report.setUpdatedAt(LocalDateTime.now());
        
        // 🌟 Flip the flag so the admin dashboard immediately highlights it!
        report.setReopened(true);
        
        String existingNotes = report.getAdminNotes() != null ? report.getAdminNotes() + "\n\n" : "";
        report.setAdminNotes(existingNotes + "⚠️ [SYSTEM]: User was unsatisfied and re-opened this report on " + LocalDateTime.now().toLocalDate().toString() + ".");
        
        reportRepository.save(report);
    }
}