package mac.prograde.api.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import mac.prograde.api.entity.LoggingEvent;
import mac.prograde.api.repository.LoggingEventRepository;

@RestController
@RequestMapping("/api/v1/admin/logs")
@PreAuthorize("hasRole('ADMIN')")
public class AdminLogController {

	@Autowired
	private LoggingEventRepository logRepository;

	@GetMapping
	public ResponseEntity<Page<LoggingEvent>> getSystemLogs(@RequestParam(defaultValue = "ALL") String level,
			@RequestParam(required = false) Long startTime, @RequestParam(required = false) Long endTime,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size,
			@RequestParam(defaultValue = "DESC") String sortDirection) {

		// OPTIMIZATION: Cap at 1000 to prevent OOM crashes, but allow enough data for
		// analytics charts
		size = Math.min(size, 1000);

		Sort sort = sortDirection.equalsIgnoreCase("ASC") ? Sort.by("timestamp").ascending()
				: Sort.by("timestamp").descending();

		PageRequest pageRequest = PageRequest.of(page, size, sort);

		// Reverted to Page so your React UI 'totalElements' and pagination works
		Page<LoggingEvent> logs = logRepository.findFilteredLogs(level, startTime, endTime, pageRequest);
		return ResponseEntity.ok(logs);
	}

	// Safely deletes child tables before parent tables for ALL durations
	@DeleteMapping("/clear")
	public ResponseEntity<?> clearLogs(@RequestParam(defaultValue = "ALL") String duration) {
		long threshold;
		long now = System.currentTimeMillis();
		long dayInMillis = 24L * 60 * 60 * 1000;

		switch (duration) {
		case "30D":
			threshold = now - (30 * dayInMillis);
			break;
		case "15D":
			threshold = now - (15 * dayInMillis);
			break;
		case "7D":
			threshold = now - (7 * dayInMillis);
			break;
		case "TODAY":
			threshold = now - dayInMillis;
			break;
		case "ALL":
		default:
			// Use max possible time to capture and delete absolutely everything
			threshold = Long.MAX_VALUE;
			break;
		}

		// MUST BE IN THIS EXACT ORDER to satisfy MySQL Foreign Key Constraints
		logRepository.deletePropertiesOlderThan(threshold); // 1. Delete child
		logRepository.deleteExceptionsOlderThan(threshold); // 2. Delete child
		logRepository.deleteLogsOlderThan(threshold); // 3. Delete parent

		return ResponseEntity.ok(Map.of("message", "Logs older than " + duration + " deleted."));
	}
}