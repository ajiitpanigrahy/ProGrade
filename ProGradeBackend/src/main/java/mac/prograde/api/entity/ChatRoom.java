package mac.prograde.api.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import mac.prograde.api.enums.ChatRoomStatus;

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