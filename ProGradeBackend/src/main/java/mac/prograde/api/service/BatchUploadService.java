package mac.prograde.api.service;

import java.io.InputStream;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import mac.prograde.api.entity.Batch;
import mac.prograde.api.entity.BatchStudent;
import mac.prograde.api.entity.Notification;
import mac.prograde.api.enums.NotificationType;
import mac.prograde.api.repository.BatchRepository;
import mac.prograde.api.repository.BatchStudentRepository;

@Service
public class BatchUploadService {

    @Autowired private BatchRepository batchRepository;
    @Autowired private BatchStudentRepository batchStudentRepository;
    @Autowired private NotificationService notificationService; // 🌟 ADDED

    @Transactional
    public String processBatchExcel(MultipartFile file) throws Exception {
        int addedCount = 0;
        
        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0); 
            
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                String rollNumber = getCellValue(row.getCell(0)).trim(); 
                String name = getCellValue(row.getCell(1)).trim();      
                String email = getCellValue(row.getCell(2)).toLowerCase().trim(); 
                String batchName = getCellValue(row.getCell(3)).toUpperCase().trim(); 

                if (email.isEmpty() || batchName.isEmpty()) continue;
                if (name.isEmpty()) name = email.split("@")[0]; 

                Batch batch = batchRepository.findByName(batchName).orElseGet(() -> {
                    Batch newBatch = new Batch();
                    newBatch.setName(batchName);
                    return batchRepository.save(newBatch);
                });

                if (!batchStudentRepository.existsByEmailAndBatchId(email, batch.getId())) {
                    BatchStudent bs = new BatchStudent();
                    bs.setRollNumber(rollNumber);
                    bs.setName(name);
                    bs.setEmail(email);
                    bs.setBatch(batch);
                    batchStudentRepository.save(bs);
                    addedCount++;

                    // 🌟 NOTIFY STUDENT THEY WERE ADDED TO A BATCH
                    Notification notif = new Notification();
                    notif.setRecipientEmail(email);
                    notif.setSender("System Admin");
                    notif.setTitle("Batch Assignment");
                    notif.setMessage("You have been successfully registered into the operational batch: " + batchName);
                    notif.setType(NotificationType.INFO);
                    notificationService.sendNotification(notif);
                }
            }
        }
        return "Success: Added " + addedCount + " student records to operational batches.";
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> {
                long longVal = (long) cell.getNumericCellValue();
                if (cell.getNumericCellValue() == longVal) yield String.valueOf(longVal);
                else yield String.valueOf(cell.getNumericCellValue());
            }
            default -> "";
        };
    }
}