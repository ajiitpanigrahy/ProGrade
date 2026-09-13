package mac.prograde.api.repository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import mac.prograde.api.entity.ChatRoom;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    @Query("SELECT c FROM ChatRoom c WHERE (c.initiatorEmail = :email1 AND c.recipientEmail = :email2) OR (c.initiatorEmail = :email2 AND c.recipientEmail = :email1)")
    Optional<ChatRoom> findRoomBetweenUsers(String email1, String email2);

    @Query("SELECT c FROM ChatRoom c WHERE c.initiatorEmail = :email OR c.recipientEmail = :email ORDER BY c.lastActivity DESC")
    List<ChatRoom> findAllUserRooms(String email);
}