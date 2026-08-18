package mac.prograde.api.repository;
import mac.prograde.api.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    @Query("SELECT c FROM ChatRoom c WHERE (c.initiatorEmail = :email1 AND c.recipientEmail = :email2) OR (c.initiatorEmail = :email2 AND c.recipientEmail = :email1)")
    Optional<ChatRoom> findRoomBetweenUsers(String email1, String email2);

    @Query("SELECT c FROM ChatRoom c WHERE c.initiatorEmail = :email OR c.recipientEmail = :email ORDER BY c.lastActivity DESC")
    List<ChatRoom> findAllUserRooms(String email);
}