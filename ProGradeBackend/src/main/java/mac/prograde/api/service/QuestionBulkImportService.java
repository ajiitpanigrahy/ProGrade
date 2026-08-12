package mac.prograde.api.service;

import mac.prograde.api.entity.Question;
import mac.prograde.api.repository.QuestionRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class QuestionBulkImportService {

	@Autowired
	private QuestionRepository questionRepository;

	@Transactional(rollbackFor = Exception.class)
	public int importExcelData(MultipartFile file) throws Exception {
		List<Question> questions = new ArrayList<>();

		try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {

			Sheet sheet = workbook.getSheetAt(0);

			// 🌟 DataFormatter elegantly converts Numbers, Booleans, and Strings into raw
			// Text!
			DataFormatter formatter = new DataFormatter();

			for (Row row : sheet) {
				// SKIP HEADER ROW
				if (row.getRowNum() == 0)
					continue;

				// BLANK CHECK BREAKPOINT (Safely formatted)
				Cell firstCell = row.getCell(0);
				if (firstCell == null || firstCell.getCellType() == CellType.BLANK
						|| formatter.formatCellValue(firstCell).trim().isEmpty()) {
					break;
				}

				Question q = new Question();

				try {
					// Extracting values using the formatter prevents the NUMERIC cell crash
					q.setTechnology(formatter.formatCellValue(row.getCell(0)).trim().toUpperCase());
					q.setDifficultyLevel(Question.DifficultyLevel
							.valueOf(formatter.formatCellValue(row.getCell(1)).trim().toUpperCase()));
					q.setQuestionText(formatter.formatCellValue(row.getCell(2)).trim());

					q.setOptionA(formatter.formatCellValue(row.getCell(3)).trim());
					q.setOptionB(formatter.formatCellValue(row.getCell(4)).trim());
					q.setOptionC(formatter.formatCellValue(row.getCell(5)).trim());
					q.setOptionD(formatter.formatCellValue(row.getCell(6)).trim());

					String correctOpt = formatter.formatCellValue(row.getCell(7)).trim().toUpperCase();
					if (!correctOpt.matches("[A-D]")) {
						throw new IllegalArgumentException("Correct option must be A, B, C, or D");
					}
					q.setCorrectOption(correctOpt);

					// Formatter perfectly handles null/empty cells by returning an empty string ""
					String topic = formatter.formatCellValue(row.getCell(8)).trim();
					if (!topic.isEmpty()) {
						q.setTopic(topic);
					}

					questions.add(q);
				} catch (Exception e) {
					throw new RuntimeException(
							"Malformed data at Row " + (row.getRowNum() + 1) + ": " + e.getMessage());
				}
			}

			questionRepository.saveAll(questions);
			return questions.size();

		} catch (Exception e) {
			throw new RuntimeException("Failed to process Excel file. " + e.getMessage());
		}
	}
}