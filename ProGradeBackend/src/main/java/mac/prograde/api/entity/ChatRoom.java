package mac.prograde.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import mac.prograde.api.enums.ChatRoomStatus;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_rooms")
@Data
public class ChatRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String initiatorEmail;
    private String recipientEmail;

    @Enumerated(EnumType.STRING)
    private ChatRoomStatus status = ChatRoomStatus.PENDING;

    private String blockedByEmail; // Tracks who initiated the block

    private LocalDateTime lastActivity;
}