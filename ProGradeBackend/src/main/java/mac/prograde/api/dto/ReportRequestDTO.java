package mac.prograde.api.dto;
import lombok.Data;

@Data
public class ReportRequestDTO {
    private String type;
    private String severity;
    private String cause;
    private String description;
    private String targetUserEmail;
    private String featureName;
    private String pageUrl;
    private String suggestions;
}