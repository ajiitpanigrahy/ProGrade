package mac.prograde.api.repository;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
            Pageable pageable
    );
}