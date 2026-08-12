package mac.prograde.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import java.util.Map;

@Entity
@Table(name = "logging_event")
@Getter
public class LoggingEvent {

	@Id
	@Column(name = "event_id")
	private Long eventId;

	@Column(name = "timestmp")
	private Long timestamp;

	@Column(name = "formatted_message", columnDefinition = "TEXT")
	private String formattedMessage;

	@Column(name = "logger_name")
	private String loggerName;

	@Column(name = "level_string")
	private String levelString;

	@Column(name = "caller_class")
	private String callerClass;

	// 🌟 This automatically joins the properties table to fetch Actor and IP
	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "logging_event_property", joinColumns = @JoinColumn(name = "event_id"))
	@MapKeyColumn(name = "mapped_key")
	@Column(name = "mapped_value")
	private Map<String, String> properties;

	// Virtual getters for React JSON response
	@Transient
	public String getActor() {
		return properties != null ? properties.getOrDefault("actor", "SYSTEM") : "SYSTEM";
	}

	@Transient
	public String getIp() {
		return properties != null ? properties.getOrDefault("ipAddress", "UNKNOWN") : "UNKNOWN";
	}
}