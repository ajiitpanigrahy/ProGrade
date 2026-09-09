package mac.prograde.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.sql.PreparedStatement;
import java.sql.Statement;

@Service
public class DatabaseAuditService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Async // Runs on a background thread so it never slows down your APIs
    public void saveLog(String level, String loggerName, String message, String actor, String ip, String className, String methodName, Throwable ex) {
        try {
            long timestamp = System.currentTimeMillis();
            String threadName = Thread.currentThread().getName();

            // 1. Insert into logging_event
            String sqlEvent = "INSERT INTO logging_event (timestmp, formatted_message, logger_name, level_string, thread_name, reference_flag, caller_filename, caller_class, caller_method, caller_line) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(sqlEvent, Statement.RETURN_GENERATED_KEYS);
                ps.setLong(1, timestamp);
                ps.setString(2, message);
                ps.setString(3, loggerName);
                ps.setString(4, level);
                ps.setString(5, threadName);
                ps.setShort(6, (short) 1);
                ps.setString(7, className + ".java");
                ps.setString(8, className);
                ps.setString(9, methodName);
                ps.setString(10, "?"); 
                return ps;
            }, keyHolder);

            if (keyHolder.getKey() == null) return;
            long eventId = keyHolder.getKey().longValue();

            // 2. Insert Actor and IP into logging_event_property
            String sqlProp = "INSERT INTO logging_event_property (event_id, mapped_key, mapped_value) VALUES (?, ?, ?)";
            jdbcTemplate.update(sqlProp, eventId, "actor", actor);
            jdbcTemplate.update(sqlProp, eventId, "ipAddress", ip);

            // 3. Insert Exception Stack Trace (if a crash happened)
            if (ex != null) {
                String sqlEx = "INSERT INTO logging_event_exception (event_id, i, trace_line) VALUES (?, ?, ?)";
                jdbcTemplate.update(sqlEx, eventId, 0, ex.getClass().getName() + ": " + ex.getMessage());
                
                StackTraceElement[] trace = ex.getStackTrace();
                for (int i = 0; i < Math.min(trace.length, 15); i++) { // Save top 15 lines of stack trace
                    jdbcTemplate.update(sqlEx, eventId, i + 1, "\tat " + trace[i].toString());
                }
            }
        } catch (Exception e) {
            // 🌟 SAFETY NET: If the DB is missing a column, ignore the error and DO NOT crash the app!
            System.err.println("⚠️ Warning: Failed to save audit log: " + e.getMessage());
        }
    }
}