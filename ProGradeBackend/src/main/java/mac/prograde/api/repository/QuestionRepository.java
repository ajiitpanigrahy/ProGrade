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

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

	// 🌟 1. High-Performance Aggregation for Technology Breakdown
	@Query("SELECT new mac.prograde.api.dto.QuestionSummaryDTO(" + "q.technology, COUNT(q), "
			+ "SUM(CASE WHEN q.difficultyLevel = 'EASY' THEN 1L ELSE 0L END), "
			+ "SUM(CASE WHEN q.difficultyLevel = 'MEDIUM' THEN 1L ELSE 0L END), "
			+ "SUM(CASE WHEN q.difficultyLevel = 'HARD' THEN 1L ELSE 0L END)) "
			+ "FROM Question q GROUP BY q.technology")
	List<QuestionSummaryDTO> getGlobalQuestionSummary();

	// 🌟 2. Aggregation for Topic Density Chart (Now includes Difficulty
	// Breakdowns!)
	@Query("SELECT new mac.prograde.api.dto.TopicSummaryDTO(" + "q.technology, q.topic, COUNT(q), "
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
}