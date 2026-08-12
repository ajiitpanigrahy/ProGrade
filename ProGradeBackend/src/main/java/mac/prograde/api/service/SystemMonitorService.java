package mac.prograde.api.service;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.search.Search;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.logging.LogLevel;
import org.springframework.boot.logging.LoggingSystem;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentLinkedDeque;

@Service
public class SystemMonitorService {

    @Autowired
    private MeterRegistry meterRegistry;

    @Autowired
    private LoggingSystem loggingSystem;

    // Rolling buffer to hold the last 60 minutes of data for the React charts
    private final Deque<Map<String, Object>> rollingMetrics = new ConcurrentLinkedDeque<>();
    private final DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

    @Scheduled(fixedRate = 60000) // Takes a snapshot every 60 seconds
    public void captureMetricsSnapshot() {
        Map<String, Object> snapshot = new HashMap<>();
        snapshot.put("time", LocalTime.now().format(timeFormatter));
        
        // 1. CPU & Memory
        snapshot.put("cpu", getGaugeValue("system.cpu.usage") * 100);
        snapshot.put("memory", getGaugeValue("jvm.memory.used") / getGaugeValue("jvm.memory.max") * 100);
        
        // 2. HTTP Traffic (Delta calculations for Stacked Bar Chart)
        snapshot.put("http2xx", getHttpCountByStatus("2"));
        snapshot.put("http4xx", getHttpCountByStatus("4"));
        snapshot.put("http5xx", getHttpCountByStatus("5"));

        // 3. GC Pauses
        snapshot.put("gcPause", getGaugeValue("jvm.gc.pause.max") * 1000); // in ms

        if (rollingMetrics.size() >= 60) {
            rollingMetrics.pollFirst(); // Keep only last 60 mins
        }
        rollingMetrics.addLast(snapshot);
    }

    public Map<String, Object> getLiveSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        
        // Live KPIs for the Cards
        health.put("jvmUsedMb", getGaugeValue("jvm.memory.used") / (1024 * 1024));
        health.put("jvmMaxMb", getGaugeValue("jvm.memory.max") / (1024 * 1024));
        health.put("activeThreads", getGaugeValue("jvm.threads.live"));
        
        // Hikari DB Pool
        health.put("dbActive", getGaugeValue("hikaricp.connections.active"));
        health.put("dbMax", getGaugeValue("hikaricp.connections.max"));
        health.put("dbPending", getGaugeValue("hikaricp.connections.pending"));
        
        // Server Uptime
        long uptimeMs = ManagementFactory.getRuntimeMXBean().getUptime();
        health.put("uptime", formatUptime(uptimeMs));

        health.put("history", new ArrayList<>(rollingMetrics));
        return health;
    }

    public void changeLogLevel(String loggerName, String level) {
        loggingSystem.setLogLevel(loggerName, LogLevel.valueOf(level.toUpperCase()));
    }

    // --- Helpers ---
    private double getGaugeValue(String metricName) {
        try {
            return meterRegistry.get(metricName).gauge().value();
        } catch (Exception e) {
            return 0.0;
        }
    }

    private double getHttpCountByStatus(String startingDigit) {
        try {
            Search search = meterRegistry.find("http.server.requests");
            return search.timers().stream()
                    .filter(t -> t.getId().getTag("status") != null && t.getId().getTag("status").startsWith(startingDigit))
                    .mapToDouble(io.micrometer.core.instrument.Timer::count)
                    .sum();
        } catch (Exception e) {
            return 0.0;
        }
    }

    private String formatUptime(long uptimeMs) {
        long days = uptimeMs / (1000 * 60 * 60 * 24);
        long hours = (uptimeMs / (1000 * 60 * 60)) % 24;
        long minutes = (uptimeMs / (1000 * 60)) % 60;
        return String.format("%dd %dh %dm", days, hours, minutes);
    }
}