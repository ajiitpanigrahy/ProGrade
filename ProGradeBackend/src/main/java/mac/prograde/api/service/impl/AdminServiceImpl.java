package mac.prograde.api.service.impl;

import lombok.RequiredArgsConstructor;
import mac.prograde.api.dto.AdminDto;
import mac.prograde.api.entity.User;
import mac.prograde.api.enums.Role;
import mac.prograde.api.repository.UserRepository;
import mac.prograde.api.service.AdminService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;

    @Override
    public AdminDto.DashboardMetrics getKpiMetrics() {
        long totalUsers = userRepository.count();
        long pendingApprovals = userRepository.countByRoleAndIsApprovedFalse(Role.EDUCATOR);

        // Mock data until Exam and Payment entities are created
        long activeExams = 1204;
        double monthlyRevenue = 12400.0;

        return new AdminDto.DashboardMetrics(totalUsers, pendingApprovals, activeExams, monthlyRevenue);
    }

    @Override
    public List<AdminDto.PendingEducator> getPendingEducators() {
        return userRepository.findByRoleAndIsApprovedFalse(Role.EDUCATOR)
                .stream()
                .map(user -> new AdminDto.PendingEducator(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public void approveEducator(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setApproved(true);
        userRepository.save(user);
    }

    @Override
    public void rejectEducator(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        userRepository.delete(user);
    }

    @Override
    public AdminDto.DashboardCharts getChartData() {
        // 1. Role Distribution (Real DB Query)
        List<Object[]> rawRoleCounts = userRepository.countUsersByRole();
        List<Map<String, Object>> roleDistribution = new ArrayList<>();
        for (Object[] row : rawRoleCounts) {
            Map<String, Object> map = new HashMap<>();
            map.put("name", row[0].toString());
            map.put("value", row[1]);
            roleDistribution.add(map);
        }

        // 2. User Growth (Mocked until you add date-range queries)
        List<Map<String, Object>> userGrowth = List.of(
                Map.of("name", "Mon", "students", 400, "educators", 24),
                Map.of("name", "Tue", "students", 300, "educators", 18),
                Map.of("name", "Wed", "students", 550, "educators", 35)
        );

        // 3. Revenue (Mocked)
        List<Map<String, Object>> revenue = List.of(
                Map.of("name", "Jan", "revenue", 4000),
                Map.of("name", "Feb", "revenue", 5500)
        );

        // 4. Pass/Fail (Mocked)
        List<Map<String, Object>> passFail = List.of(
                Map.of("name", "Passed", "value", 68, "color", "#10b981"),
                Map.of("name", "Failed", "value", 32, "color", "#ef4444")
        );

        return new AdminDto.DashboardCharts(roleDistribution, userGrowth, revenue, passFail);
    }
}