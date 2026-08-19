package mac.prograde.api.service;

import mac.prograde.api.entity.Notification;
import mac.prograde.api.entity.Question;
import mac.prograde.api.enums.NotificationType;
import mac.prograde.api.repository.QuestionRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class QuestionBulkImportService {

    @Autowired private QuestionRepository questionRepository;
    @Autowired private NotificationService notificationService;

    @Transactional(rollbackFor = Exception.class)
    public int importExcelData(MultipartFile file) throws Exception {
        List<Question> questions = new ArrayList<>();

        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            DataFormatter formatter = new DataFormatter();

            for (Row row : sheet) {
                // Skip Header Row
                if (row.getRowNum() == 0) continue;

                Cell firstCell = row.getCell(0);
                if (firstCell == null || firstCell.getCellType() == CellType.BLANK || formatter.formatCellValue(firstCell).trim().isEmpty()) {
                    break;
                }

                Question q = new Question();
                try {
                    String tech = formatter.formatCellValue(row.getCell(0)).trim().toUpperCase();
                    q.setTechnology(tech);
                    q.setDifficultyLevel(Question.DifficultyLevel.valueOf(formatter.formatCellValue(row.getCell(1)).trim().toUpperCase()));
                    
                    int totalCells = row.getLastCellNum(); // Checks how many columns are in this specific row

                    // 🌟 IF ROW HAS 10 OR MORE COLUMNS (NEW CODING TEMPLATE)
                    if (totalCells >= 10) {
                        q.setQuestionType("CODING"); // 🌟 FORCE CODING TYPE
                        q.setQuestionText(formatter.formatCellValue(row.getCell(2)).trim());                        
                        // Grab raw code without destroying internal indentation (stripTrailing instead of trim)
                        String rawSnippet = formatter.formatCellValue(row.getCell(3));
                        if (!rawSnippet.trim().isEmpty()) {
                            q.setCodeSnippet(rawSnippet.stripTrailing()); 
                        }

                        String lang = formatter.formatCellValue(row.getCell(4)).trim().toLowerCase();
                        q.setCodeLanguage(!lang.isEmpty() ? lang : tech.toLowerCase());

                        q.setOptionA(formatter.formatCellValue(row.getCell(5)).trim());
                        q.setOptionB(formatter.formatCellValue(row.getCell(6)).trim());
                        q.setOptionC(formatter.formatCellValue(row.getCell(7)).trim());
                        q.setOptionD(formatter.formatCellValue(row.getCell(8)).trim());

                        String correctOpt = formatter.formatCellValue(row.getCell(9)).trim().toUpperCase();
                        if (!correctOpt.matches("[A-D]")) throw new IllegalArgumentException("Correct option must be A, B, C, or D");
                        q.setCorrectOption(correctOpt);

                        String topic = row.getCell(10) != null ? formatter.formatCellValue(row.getCell(10)).trim() : "";
                        if (!topic.isEmpty()) q.setTopic(topic);
                    } 
                    // 🌟 IF ROW HAS 9 COLUMNS (LEGACY TEMPLATE)
                    else {
                        String rawQuestionText = formatter.formatCellValue(row.getCell(2));
                        
                        // SMART FALLBACK: Auto-extract markdown code fences (```) if an educator pasted them!
                        if (rawQuestionText.contains("```")) {
                            q.setQuestionType("CODING");
                            int startFence = rawQuestionText.indexOf("```");
                            int endFence = rawQuestionText.lastIndexOf("```");
                            
                            if (startFence != endFence) { 
                                String textPart = rawQuestionText.substring(0, startFence).trim();
                                String codePart = rawQuestionText.substring(startFence + 3, endFence).trim();
                                
                                // Detect language tag like ```java
                                String[] codeLines = codePart.split("\n", 2);
                                String firstLine = codeLines[0].trim();
                                if (firstLine.matches("^[a-zA-Z0-9#+]+$")) {
                                    q.setCodeLanguage(firstLine.toLowerCase());
                                    codePart = codeLines.length > 1 ? codeLines[1] : "";
                                } else {
                                    q.setCodeLanguage(tech.toLowerCase());
                                }
                                
                                q.setQuestionText(!textPart.isEmpty() ? textPart : "What is the output of the following code snippet?");
                                q.setCodeSnippet(codePart);
                            } else {
                                q.setQuestionText(rawQuestionText.trim());
                            }
                        } else {
                            q.setQuestionType("THEORY");
                            q.setQuestionText(rawQuestionText.trim());
                        }

                        q.setOptionA(formatter.formatCellValue(row.getCell(3)).trim());
                        q.setOptionB(formatter.formatCellValue(row.getCell(4)).trim());
                        q.setOptionC(formatter.formatCellValue(row.getCell(5)).trim());
                        q.setOptionD(formatter.formatCellValue(row.getCell(6)).trim());

                        String correctOpt = formatter.formatCellValue(row.getCell(7)).trim().toUpperCase();
                        if (!correctOpt.matches("[A-D]")) throw new IllegalArgumentException("Correct option must be A, B, C, or D");
                        q.setCorrectOption(correctOpt);

                        String topic = row.getCell(8) != null ? formatter.formatCellValue(row.getCell(8)).trim() : "";
                        if (!topic.isEmpty()) q.setTopic(topic);
                    }

                    questions.add(q);
                } catch (Exception e) {
                    throw new RuntimeException("Malformed data at Row " + (row.getRowNum() + 1) + ": " + e.getMessage());
                }
            }

            questionRepository.saveAll(questions);

            // 🌟 NOTIFY UPLOADER
            String uploaderEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            Notification notif = new Notification();
            notif.setRecipientEmail(uploaderEmail);
            notif.setSender("System Importer");
            notif.setTitle("Question Bank Import Complete ✅");
            notif.setMessage("Successfully processed and mapped " + questions.size() + " standard and coding questions.");
            notif.setType(NotificationType.SUCCESS);
            notificationService.sendNotification(notif);

            return questions.size();

        } catch (Exception e) {
            throw new RuntimeException("Failed to process Excel file. " + e.getMessage());
        }
    }
}