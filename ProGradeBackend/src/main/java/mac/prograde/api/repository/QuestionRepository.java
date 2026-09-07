package mac.prograde.api.repository;

import mac.prograde.api.dto.QuestionSummaryDTO;
import mac.prograde.api.dto.TopicSummaryDTO;
import mac.prograde.api.entity.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    // 🌟 REQUIRED FOR EDUCATOR DASHBOARD KPIs
    long countByDifficultyLevel(String difficultyLevel);

    // 🌟 1. High-Performance Aggregation for Technology Breakdown
    @Query("SELECT new mac.prograde.api.dto.QuestionSummaryDTO(q.technology, COUNT(q), "
            + "SUM(CASE WHEN q.difficultyLevel = 'EASY' THEN 1L ELSE 0L END), "
            + "SUM(CASE WHEN q.difficultyLevel = 'MEDIUM' THEN 1L ELSE 0L END), "
            + "SUM(CASE WHEN q.difficultyLevel = 'HARD' THEN 1L ELSE 0L END)) "
            + "FROM Question q GROUP BY q.technology")
    List<QuestionSummaryDTO> getGlobalQuestionSummary();

    // 🌟 2. Aggregation for Topic Density Chart
    @Query("SELECT new mac.prograde.api.dto.TopicSummaryDTO(q.technology, q.topic, COUNT(q), "
            + "SUM(CASE WHEN q.difficultyLevel = 'EASY' THEN 1L ELSE 0L END), "
            + "SUM(CASE WHEN q.difficultyLevel = 'MEDIUM' THEN 1L ELSE 0L END), "
            + "SUM(CASE WHEN q.difficultyLevel = 'HARD' THEN 1L ELSE 0L END)) "
            + "FROM Question q WHERE q.topic IS NOT NULL AND q.topic != '' "
            + "GROUP BY q.technology, q.topic ORDER BY COUNT(q) DESC")
    List<TopicSummaryDTO> getGlobalTopicSummary();

    // 🌟 3. Paginated, Searchable Grid Fetcher
    @Query("SELECT q FROM Question q WHERE q.technology = :technology " + "AND (:search IS NULL OR :search = '' "
            + "OR LOWER(q.topic) LIKE LOWER(CONCAT('%', :search, '%')) "
            + "OR LOWER(q.questionText) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Question> findQuestionsByTechnologyAndSearch(@Param("technology") String technology,
            @Param("search") String search, Pageable pageable);

    // 🌟 Removed LIMIT from the string, added Pageable to the parameters
    @Query(value = "SELECT * FROM questions WHERE technology = :tech AND difficulty_level = :diff ORDER BY RAND()", nativeQuery = true)
    List<Question> findRandomQuestions(@Param("tech") String tech, @Param("diff") String diff, Pageable pageable);
    
    // 🌟 NEW: Fetch by Tech, Topic, and Difficulty
    @Query("SELECT q FROM Question q WHERE UPPER(q.technology) = UPPER(:tech) AND UPPER(q.topic) = UPPER(:topic) AND UPPER(q.difficultyLevel) = UPPER(:diff) ORDER BY RAND()")
    List<Question> findRandomQuestionsWithTopic(
        @Param("tech") String tech, 
        @Param("topic") String topic, 
        @Param("diff") String diff, 
        Pageable pageable
    );
    
    // 🌟 1. JPQL INVENTORY CHECKER (Bulletproof Mapping & Trimming)
    @Query("SELECT q.topic, q.difficultyLevel, " +
           "SUM(CASE WHEN TRIM(UPPER(q.questionType)) = 'THEORY' OR q.questionType IS NULL THEN 1L ELSE 0L END), " + 
           "SUM(CASE WHEN TRIM(UPPER(q.questionType)) = 'CODING' THEN 1L ELSE 0L END) " + 
           "FROM Question q WHERE UPPER(q.technology) = UPPER(:tech) " +
           "GROUP BY q.topic, q.difficultyLevel")
    List<Object[]> getDetailedTopicInventoryByTech(@Param("tech") String tech);

    // 🌟 2A. JPQL RANDOM FETCHER FOR THEORY MCQs
    @Query("SELECT q FROM Question q WHERE UPPER(q.technology) = UPPER(:tech) " +
           "AND (:topic = 'ALL' OR UPPER(q.topic) = UPPER(:topic)) " +
           "AND UPPER(q.difficultyLevel) = UPPER(:diff) " +
           "AND (TRIM(UPPER(q.questionType)) = 'THEORY' OR q.questionType IS NULL) " +
           "ORDER BY RAND()")
    List<Question> findRandomTheoryQuestions(
            @Param("tech") String tech, 
            @Param("topic") String topic, 
            @Param("diff") String diff, 
            Pageable pageable
    );

    // 🌟 2B. JPQL RANDOM FETCHER FOR CODING MCQs
    @Query("SELECT q FROM Question q WHERE UPPER(q.technology) = UPPER(:tech) " +
           "AND (:topic = 'ALL' OR UPPER(q.topic) = UPPER(:topic)) " +
           "AND UPPER(q.difficultyLevel) = UPPER(:diff) " +
           "AND TRIM(UPPER(q.questionType)) = 'CODING' " +
           "ORDER BY RAND()")
    List<Question> findRandomCodingQuestions(
            @Param("tech") String tech, 
            @Param("topic") String topic, 
            @Param("diff") String diff, 
            Pageable pageable
    );

    // 🌟 3. JPQL FILTERED GRID FETCHER FOR MANUAL MODE
    @Query("SELECT q FROM Question q WHERE UPPER(q.technology) = UPPER(:technology) " +
           "AND (:search IS NULL OR :search = '' OR LOWER(q.topic) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(q.questionText) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:typeFilter = 'ALL' " +
           "  OR (:typeFilter = 'CODING' AND TRIM(UPPER(q.questionType)) = 'CODING') " +
           "  OR (:typeFilter = 'THEORY' AND (TRIM(UPPER(q.questionType)) = 'THEORY' OR q.questionType IS NULL)))")
    Page<Question> findQuestionsByTechnologySearchAndType(
            @Param("technology") String technology,
            @Param("search") String search,
            @Param("typeFilter") String typeFilter, 
            Pageable pageable
    );
    
    public interface QuestionContributionDTO {
        String getEmail();
        String getName();
        String getRole();
        Long getTotalQuestions();
        LocalDateTime getLastContribution();
    }

    @Query("SELECT q.createdByEmail AS email, q.createdByName AS name, q.creatorRole AS role, " +
            "COUNT(q.id) AS totalQuestions, MAX(q.createdAt) AS lastContribution " +
            "FROM Question q " +
            "WHERE q.createdByEmail IS NOT NULL " +
            "GROUP BY q.createdByEmail, q.createdByName, q.creatorRole " +
            "ORDER BY MAX(q.createdAt) DESC")
    List<QuestionContributionDTO> getContributionHistory();
}