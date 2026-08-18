package mac.prograde.api.controller;

import mac.prograde.api.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

	@Autowired
	private ChatService chatService;
	@Autowired
	private mac.prograde.api.repository.ChatRoomRepository roomRepository;
	@Autowired
	private mac.prograde.api.repository.ChatMessageRepository messageRepository;

	@GetMapping("/search")
	public ResponseEntity<?> searchUser(@RequestParam String email) {
		return ResponseEntity.ok(chatService.searchUserByEmail(email));
	}

	@PostMapping("/send")
	public ResponseEntity<?> sendMessage(Authentication auth, @RequestBody Map<String, Object> payload) {
		return ResponseEntity.ok(chatService.sendMessage(auth.getName(), (String) payload.get("targetEmail"),
				(String) payload.get("content"), (String) payload.get("fileUrl"), (String) payload.get("fileName"),
				(Boolean) payload.getOrDefault("isViewOnce", false)));
	}

	@PatchMapping("/room/{roomId}/status")
	public ResponseEntity<?> updateRoom(Authentication auth, @PathVariable Long roomId, @RequestParam String action) {
		return ResponseEntity.ok(chatService.updateRoomStatus(roomId, auth.getName(), action));
	}

	@PatchMapping("/room/{roomId}/seen")
	public ResponseEntity<?> markSeen(Authentication auth, @PathVariable Long roomId) {
		chatService.markMessagesAsSeen(roomId, auth.getName());
		return ResponseEntity.ok(Map.of("success", true));
	}

	@PostMapping("/room/{roomId}/typing")
	public ResponseEntity<?> typing(Authentication auth, @PathVariable Long roomId, @RequestParam boolean isTyping) {
		chatService.sendTypingEvent(roomId, auth.getName(), isTyping);
		return ResponseEntity.ok(Map.of("success", true));
	}

	// Add inside ChatController.java

	@GetMapping("/rooms")
	public ResponseEntity<?> getUserRooms(Authentication auth) {
		return ResponseEntity.ok(roomRepository.findAllUserRooms(auth.getName()));
	}

	@GetMapping("/room/{roomId}/messages")
	public ResponseEntity<?> getRoomMessages(Authentication auth, @PathVariable Long roomId) {
		// Automatically mark as seen when fetching
		chatService.markMessagesAsSeen(roomId, auth.getName());
		return ResponseEntity.ok(messageRepository.findByRoomIdOrderByTimestampAsc(roomId));
	}
}