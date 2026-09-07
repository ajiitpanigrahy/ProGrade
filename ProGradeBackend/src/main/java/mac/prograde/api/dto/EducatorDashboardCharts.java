package mac.prograde.api.dto;

import java.util.List;

import lombok.Data;

@Data
public class EducatorDashboardCharts {
    public List<VelocityData> velocity;
    public List<MasteryData> mastery;
    public List<DistributionData> distribution;
    // Getters and Setters...
}
