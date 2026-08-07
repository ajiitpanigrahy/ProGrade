package mac.prograde.api.service;

import mac.prograde.api.dto.AdminDto;
import java.util.List;
import java.util.UUID;

public interface AdminService {

    /**
     * Fetch the 4 main KPI metrics for the top dashboard cards.
     */
    AdminDto.DashboardMetrics getKpiMetrics();

    /**
     * Fetch the queue of educators waiting for approval.
     */
    List<AdminDto.PendingEducator> getPendingEducators();

    /**
     * Approve an educator account.
     * @param userId The UUID of the educator to approve
     */
    void approveEducator(UUID userId);

    /**
     * Reject (delete) an educator account request.
     * @param userId The UUID of the educator to reject
     */
    void rejectEducator(UUID userId);

    /**
     * Generate data for all the Recharts components on the frontend.
     */
    AdminDto.DashboardCharts getChartData();
}