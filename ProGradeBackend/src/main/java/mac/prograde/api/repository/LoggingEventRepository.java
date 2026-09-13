package mac.prograde.api.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import mac.prograde.api.entity.LoggingEvent;

@Repository
public interface LoggingEventRepository extends JpaRepository<LoggingEvent, Long> {

    @Query("SELECT l FROM LoggingEvent l WHERE " +
            "(:level IS NULL OR :level = 'ALL' OR l.levelString = :level) AND " +
            "(:startTime IS NULL OR l.timestamp >= :startTime) AND " +
            "(:endTime IS NULL OR l.timestamp <= :endTime)")
    Page<LoggingEvent> findFilteredLogs(
            @Param("level") String level,
            @Param("startTime") Long startTime,
            @Param("endTime") Long endTime,
            Pageable pageable);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM logging_event_property WHERE event_id IN (SELECT event_id FROM logging_event WHERE timestmp <= :timestamp)", nativeQuery = true)
    void deletePropertiesOlderThan(@Param("timestamp") Long timestamp);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM logging_event_exception WHERE event_id IN (SELECT event_id FROM logging_event WHERE timestmp <= :timestamp)", nativeQuery = true)
    void deleteExceptionsOlderThan(@Param("timestamp") Long timestamp);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM logging_event WHERE timestmp <= :timestamp", nativeQuery = true)
    void deleteLogsOlderThan(@Param("timestamp") Long timestamp);
}