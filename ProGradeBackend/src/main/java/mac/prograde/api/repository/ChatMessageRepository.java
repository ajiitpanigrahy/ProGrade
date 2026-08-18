package mac.prograde.api.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import mac.prograde.api.entity.ChatMessage;
import mac.prograde.api.enums.MessageStatus;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByRoomIdOrderByTimestampAsc(Long roomId);
    List<ChatMessage> findByRoomIdAndSenderEmailNotAndStatus(Long roomId, String email, MessageStatus status);
 // 🌟 FIX: Forces direct SQL update to guarantee ticks never revert!
    @Modifying
    @Transactional
    @Query("UPDATE ChatMessage m SET m.status = 'SEEN' WHERE m.roomId = :roomId AND m.senderEmail != :email AND m.status != 'SEEN'")
    int updateStatusToSeen(Long roomId, String email);
    
    // 🌟 HELPER TO FIND UNREAD MESSAGES RELIABLY
    @Query("SELECT m FROM ChatMessage m WHERE m.roomId = :roomId AND m.senderEmail != :email AND m.status != 'SEEN'")
    List<ChatMessage> findUnreadMessages(Long roomId, String email);
}