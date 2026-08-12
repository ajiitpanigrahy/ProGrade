package mac.prograde.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopicSummaryDTO {
    private String technology;
    private String topic;
    private long totalCount;
    private long easyCount;
    private long mediumCount;
    private long hardCount;
}