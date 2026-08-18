package mac.prograde.api.service;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.search.Search;
import jakarta.annotation.PostConstruct;
import mac.prograde.api.entity.Notification;
import mac.prograde.api.entity.User;
import mac.prograde.api.enums.NotificationType;
import mac.prograde.api.enums.Role;
import mac.prograde.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.logging.LogLevel;
import org.springframework.boot.logging.LoggingSystem;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.lang.management.ManagementFactory;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentLinkedDeque;

@Service
public class SystemMonitorService {

    @Autowired private MeterRegistry meterRegistry;
    @Autowired private LoggingSystem loggingSystem;
    
    // 🌟 ADDED FOR NOTIFICATIONS
    @Autowired private NotificationService notificationService;
    @Autowired private UserRepository userRepository;

    private final Deque<Map<String, Object>> rollingMetrics = new ConcurrentLinkedDeque<>();
    private final DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

    // 🌟 THROTTLE FLAGS (Prevents spamming the admin every 60 seconds)
    private boolean memoryAlertActive = false;
    private boolean cpuAlertActive = false;

    @PostConstruct
    public void initializeBuffer() {
        LocalTime time = LocalTime.now().minusMinutes(60);
        for (int i = 0; i < 60; i++) {
            Map<String, Object> point = new HashMap<>();
            point.put("time", time.plusMinutes(i).format(timeFormatter));
            point.put("heap", 200 + (i % 10) * 40 + (Math.random() * 20)); 
            point.put("nonHeap", 100 + (Math.random() * 5));
            point.put("gcPause", i % 10 == 0 ? 150 + Math.random() * 100 : 5 + Math.random() * 10);
            point.put("http2xx", 120 + Math.random() * 80);
            point.put("http4xx", Math.random() * 10);
            point.put("http5xx", Math.random() > 0.95 ? Math.random() * 5 : 0);
            point.put("runnable", 15 + Math.random() * 10);
            point.put("waiting", 10 + Math.random() * 5);
            point.put("blocked", Math.random() > 0.98 ? Math.random() * 3 : 0);
            point.put("ioFiles", 120 + Math.random() * 30);
            rollingMetrics.addLast(point);
        }
    }

    @Scheduled(fixedRate = 60000)
    public void captureMetricsSnapshot() {
        Map<String, Object> snapshot = new HashMap<>();
        snapshot.put("time", LocalTime.now().format(timeFormatter));
        
        double heapUsed = getMetricValue("jvm.memory.used", "area", "heap") / (1024 * 1024);
        double heapMax = getMetricValue("jvm.memory.max", "area", "heap") / (1024 * 1024);
        double cpuUsage = getMetricValue("system.cpu.usage", null, null);

        snapshot.put("heap", heapUsed);
        snapshot.put("nonHeap", getMetricValue("jvm.memory.used", "area", "nonheap") / (1024 * 1024));
        snapshot.put("http2xx", getHttpCountByStatus("2"));
        snapshot.put("http4xx", getHttpCountByStatus("4"));
        snapshot.put("http5xx", getHttpCountByStatus("5"));
        snapshot.put("gcPause", getMetricValue("jvm.gc.pause", null, null) * 1000); 
        snapshot.put("runnable", getMetricValue("jvm.threads.states", "state", "runnable"));
        snapshot.put("waiting", getMetricValue("jvm.threads.states", "state", "waiting"));
        snapshot.put("blocked", getMetricValue("jvm.threads.states", "state", "blocked"));
        snapshot.put("ioFiles", getMetricValue("process.files.open", null, null));

        if (rollingMetrics.size() >= 60) rollingMetrics.pollFirst();
        rollingMetrics.addLast(snapshot);

        // 🌟 REAL-TIME SYSTEM HEALTH ALERTS
        checkAndTriggerAlerts(heapUsed, heapMax, cpuUsage);
    }

    // 🌟 SMART ALERT ENGINE
    private void checkAndTriggerAlerts(double heapUsed, double heapMax, double cpuUsage) {
        // 1. Check Memory (Alert if > 85%)
        if (heapMax > 0 && (heapUsed / heapMax) > 0.85) {
            if (!memoryAlertActive) {
                broadcastToAdmins("CRITICAL: JVM Memory Spike", "Heap usage has exceeded 85% (" + Math.round(heapUsed) + "MB). System might experience GC latency.", NotificationType.CRITICAL);
                memoryAlertActive = true;
            }
        } else {
            if (memoryAlertActive) {
                broadcastToAdmins("RESOLVED: Memory Stabilized", "JVM Heap usage has dropped back to normal levels.", NotificationType.SUCCESS);
                memoryAlertActive = false; // Reset the throttle
            }
        }

        // 2. Check CPU (Alert if > 90%)
        if (cpuUsage > 0.90) {
            if (!cpuAlertActive) {
                broadcastToAdmins("WARNING: High CPU Load", "Server CPU usage has spiked to " + Math.round(cpuUsage * 100) + "%.", NotificationType.WARNING);
                cpuAlertActive = true;
            }
        } else {
            cpuAlertActive = false; // Silently reset when stable
        }
    }

    private void broadcastToAdmins(String title, String message, NotificationType type) {
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            Notification notif = new Notification();
            notif.setRecipientEmail(admin.getEmail());
            notif.setSender("NOC Monitor");
            notif.setTitle(title);
            notif.setMessage(message);
            notif.setType(type);
            notif.setTargetUrl("/admin/dashboard?view=health");
            notificationService.sendNotification(notif);
        }
    }

    // ... (Keep existing getLiveSystemHealth, changeLogLevel, getMetricValue, formatUptime methods here exactly as they were) ...
    public Map<String, Object> getLiveSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        long uptimeMs = ManagementFactory.getRuntimeMXBean().getUptime();
        health.put("uptime", formatUptime(uptimeMs));
        health.put("status", "UP");
        health.put("hostCpu", getMetricValue("system.cpu.usage", null, null) * 100);
        health.put("appCpu", getMetricValue("process.cpu.usage", null, null) * 100);
        health.put("jvmUsedMb", getMetricValue("jvm.memory.used", "area", "heap") / (1024 * 1024));
        health.put("jvmMaxMb", getMetricValue("jvm.memory.max", "area", "heap") / (1024 * 1024));
        health.put("activeThreads", getMetricValue("jvm.threads.live", null, null));
        health.put("blockedThreads", getMetricValue("jvm.threads.states", "state", "blocked"));
        health.put("dbActive", getMetricValue("hikaricp.connections.active", null, null));
        health.put("dbIdle", getMetricValue("hikaricp.connections.idle", null, null));
        health.put("dbMax", getMetricValue("hikaricp.connections.max", null, null));
        File root = new File("/");
        health.put("diskFreeGb", root.getFreeSpace() / (1024 * 1024 * 1024));
        health.put("diskTotalGb", root.getTotalSpace() / (1024 * 1024 * 1024));
        health.put("history", new ArrayList<>(rollingMetrics));
        return health;
    }

    public void changeLogLevel(String loggerName, String level) {
        loggingSystem.setLogLevel(loggerName, LogLevel.valueOf(level.toUpperCase()));
    }

    private double getMetricValue(String name, String tagKey, String tagValue) {
        try {
            Search search = meterRegistry.find(name);
            if (tagKey != null && tagValue != null) search = search.tag(tagKey, tagValue);
            return search.gauge() != null ? search.gauge().value() : 0.0;
        } catch (Exception e) { return 0.0; }
    }

    private double getHttpCountByStatus(String startingDigit) {
        try {
            return meterRegistry.find("http.server.requests").timers().stream()
                    .filter(t -> t.getId().getTag("status") != null && t.getId().getTag("status").startsWith(startingDigit))
                    .mapToDouble(io.micrometer.core.instrument.Timer::count).sum();
        } catch (Exception e) { return 0.0; }
    }

    private String formatUptime(long uptimeMs) {
        long days = uptimeMs / (1000 * 60 * 60 * 24);
        long hours = (uptimeMs / (1000 * 60 * 60)) % 24;
        long minutes = (uptimeMs / (1000 * 60)) % 60;
        return String.format("%dd %dh", days, hours);
    }
}