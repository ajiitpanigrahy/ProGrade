package mac.prograde.api.dto;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;
import java.util.Map;

public class AdminDto {

    // KPI Summary Cards
    public record DashboardMetrics(
            long totalUsers,
            long pendingApprovals,
            long activeExams, // Placeholder until Exam entity exists
            double monthlyRevenue // Placeholder until Payment entity exists
    ) {}

    // Educator Approval Queue
    public record PendingEducator(
            UUID id,
            String name,
            String email,
            LocalDateTime dateApplied
    ) {}

    // Charts Data
    public record DashboardCharts(
            List<Map<String, Object>> roleDistribution,
            List<Map<String, Object>> userGrowth,
            List<Map<String, Object>> revenueGrowth,
            List<Map<String, Object>> passFailRatio
    ) {}
}