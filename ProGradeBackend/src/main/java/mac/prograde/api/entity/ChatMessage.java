package mac.prograde.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import mac.prograde.api.enums.MessageStatus;
import java.time.LocalDateTime;

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