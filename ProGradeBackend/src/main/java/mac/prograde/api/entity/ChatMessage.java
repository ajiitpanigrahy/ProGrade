package mac.prograde.api.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import mac.prograde.api.enums.MessageStatus;

@Entity
@Table(name = "chat_messages")
@Data
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long roomId;
    private String senderEmail;
    
    @Column(columnDefinition = "TEXT")
    private String content;

    private String fileUrl; 
    private String fileName;
    
    private boolean isViewOnce = false; // 🌟 NEW
    private boolean isFlagged = false;  // 🌟 NEW (For vulgarity)

    @Enumerated(EnumType.STRING)
    private MessageStatus status = MessageStatus.SENT;

    private LocalDateTime timestamp = LocalDateTime.now();
    private LocalDateTime deliveredAt; // 🌟 NEW
    private LocalDateTime seenAt;      // 🌟 NEW
}