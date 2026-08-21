package mac.prograde.api.service;

import mac.prograde.api.entity.*;
import mac.prograde.api.enums.*;
import mac.prograde.api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // 🌟 IMPORT THIS

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ChatService {

	@Autowired
	private ChatRoomRepository roomRepository;
	@Autowired
	private ChatMessageRepository messageRepository;
	@Autowired
	private UserRepository userRepository;
	@Autowired
	private NotificationService notificationService;

	public Map<String, Object> searchUserByEmail(String email) {
		User user = userRepository.findByEmail(email);
		if (user == null)
			throw new RuntimeException("User does not exist in our system.");

		return Map.of("email", user.getEmail(), "name", user.getFullName(), "role", user.getRole(), "isOnline",
				notificationService.isUserOnline(user.getEmail()));
	}

	// 🌟 BASIC PROFANITY FILTER LIST (You can expand this later)
	private static final Set<String> BANNED_WORDS = new HashSet<>(Arrays.asList(
	        // === Tier 1: Severe Profanity & Insults ===
	        "fuck", "fucker", "fucking", "fuckhead", "fuckface", "motherfucker",
	        "shit", "shitty", "shithead", "shitface", "bullshit",
	        "bitch", "bitches", "bitchy",
	        "ass", "asshole", "assholes", "jackass", "dumbass",
	        "bastard", "bastards", "cunt", "cunts", "twat", "wanker", "prick", "dick", "dickhead",

	        // === Tier 2: Explicit & Adult Content ===
	        "porn", "porno", "pornography", "nude", "nudes", "nudity", "naked",
	        "sex", "sexy", "intercourse", "erotic", "xxx", "hentai",
	        "orgasm", "orgasms", "ejaculation", "semen", "sperm",
	        "pussy", "vagina", "penis", "clitoris", "boob", "boobs", "tits", "titties", "breasts",
	        "anal", "blowjob", "handjob", "cums", "cumming", "deepthroat",

	        // === Tier 3: Hate Speech & Severe Slurs ===
	        // Note: It is critical to include historical/racial/identity slurs 
	        // to protect your users from harassment and keep the platform safe.
	        "nigger", "nigga", "chink", "spic", "faggot", "fag", "dyke", "kike", "retard", "retarded"
	    ));
	@Transactional
    public ChatMessage sendMessage(String senderEmail, String targetEmail, String content, String fileUrl, String fileName, boolean isViewOnce) {
        
        // 🌟 1. PROFANITY & HARASSMENT FILTER
        boolean flagged = false;
        if (content != null) {
            String lowerContent = content.toLowerCase();
            for (String word : BANNED_WORDS) {
                if (lowerContent.contains(word)) {
                    flagged = true;
                    content = "🚫 [This message was removed by the Auto-Moderator for violating Professional Conduct policies]";
                    fileUrl = null; // Strip files if flagged
                    
                    // Trigger Admin Notification!
                    Notification adminAlert = new Notification();
                    adminAlert.setRecipientEmail("admin@prograde.com"); // Replace with logic to find admins
                    adminAlert.setSender("Security AI");
                    adminAlert.setTitle("Profanity Alert 🚨");
                    adminAlert.setMessage("User " + senderEmail + " attempted to send inappropriate content to " + targetEmail);
                    adminAlert.setType(NotificationType.CRITICAL);
                    notificationService.sendNotification(adminAlert);
                    break;
                }
            }
        }

        ChatRoom room = roomRepository.findRoomBetweenUsers(senderEmail, targetEmail).orElseGet(() -> {
            ChatRoom newRoom = new ChatRoom();
            newRoom.setInitiatorEmail(senderEmail);
            newRoom.setRecipientEmail(targetEmail);
            return roomRepository.save(newRoom);
        });

        if (room.getStatus() == ChatRoomStatus.BLOCKED) throw new RuntimeException("Cannot send message. Chat is blocked.");

        room.setLastActivity(LocalDateTime.now());
        roomRepository.save(room);

        ChatMessage msg = new ChatMessage();
        msg.setRoomId(room.getId());
        msg.setSenderEmail(senderEmail);
        msg.setContent(content);
        msg.setFileUrl(fileUrl);
        msg.setFileName(fileName);
        msg.setViewOnce(isViewOnce); // 🌟 Set View Once
        msg.setFlagged(flagged);
        
        // 🌟 SET DELIVERY TIMESTAMP
        if (notificationService.isUserOnline(targetEmail)) {
            msg.setStatus(MessageStatus.DELIVERED);
            msg.setDeliveredAt(LocalDateTime.now());
        }
        
        ChatMessage saved = messageRepository.save(msg);
        notificationService.sendEvent(targetEmail, "CHAT_MESSAGE", saved);

        // =========================================================
        // 🌟 EXACT PLACEMENT: TRIGGER THE BELL NOTIFICATION HERE!
        // =========================================================
        try {
            Notification chatNotif = new Notification();
            chatNotif.setRecipientEmail(targetEmail);
            chatNotif.setSender(senderEmail);
            chatNotif.setTitle("New Message from " + senderEmail.split("@")[0]);
            chatNotif.setMessage(flagged ? "They attempted to send flagged content." : content);
            chatNotif.setType(NotificationType.CHAT_MESSAGE);
            chatNotif.setTargetUrl("/student/dashboard?view=messages");
            notificationService.sendNotification(chatNotif);
        } catch (Exception e) {
            System.err.println("Failed to send chat notification: " + e.getMessage());
        }

        return saved;
    }

    @Transactional // 🌟 Force Database Sync
    public void markMessagesAsSeen(Long roomId, String userEmail) {
        List<ChatMessage> unread = messageRepository.findUnreadMessages(roomId, userEmail);
        
        if (!unread.isEmpty()) {
            LocalDateTime now = LocalDateTime.now();
            
            for (ChatMessage m : unread) {
                m.setStatus(MessageStatus.SEEN);
                m.setSeenAt(now); // 🌟 SET EXACT SEEN TIME
                
                // 🌟 DESTROY VIEW-ONCE CONTENT PERMANENTLY
                if (m.isViewOnce()) {
                    m.setContent("💣 [View-Once Message Opened]");
                    m.setFileUrl(null);
                    m.setFileName(null);
                }
            }
            messageRepository.saveAllAndFlush(unread); // 🌟 FORCE SAVE TO SQL

            // Notify Sender with the Timestamp!
            ChatRoom room = roomRepository.findById(roomId).orElse(null);
            if (room != null) {
                String senderToNotify = room.getInitiatorEmail().equals(userEmail) ? room.getRecipientEmail() : room.getInitiatorEmail();
                notificationService.sendEvent(senderToNotify, "MESSAGES_SEEN", Map.of(
                    "roomId", roomId,
                    "seenAt", now.toString()
                ));
            }
        }
    }

	@Transactional // 🌟 ADDED: Ensures block/accept saves
	public ChatRoom updateRoomStatus(Long roomId, String userEmail, String action) {
		ChatRoom room = roomRepository.findById(roomId).orElseThrow();

		if (action.equalsIgnoreCase("ACCEPT")) {
			room.setStatus(ChatRoomStatus.ACCEPTED);
			room.setBlockedByEmail(null);
		} else if (action.equalsIgnoreCase("BLOCK")) {
			room.setStatus(ChatRoomStatus.BLOCKED);
			room.setBlockedByEmail(userEmail);
		} else if (action.equalsIgnoreCase("UNBLOCK")) {
			if (!userEmail.equals(room.getBlockedByEmail()))
				throw new RuntimeException("Only the blocker can unblock.");
			room.setStatus(ChatRoomStatus.ACCEPTED);
			room.setBlockedByEmail(null);
		}

		ChatRoom saved = roomRepository.save(room);
		String targetEmail = room.getInitiatorEmail().equals(userEmail) ? room.getRecipientEmail()
				: room.getInitiatorEmail();
		notificationService.sendEvent(targetEmail, "ROOM_UPDATE", saved);
		return saved;
	}

	public void sendTypingEvent(Long roomId, String senderEmail, boolean isTyping) {
		ChatRoom room = roomRepository.findById(roomId).get();
		String targetEmail = room.getInitiatorEmail().equals(senderEmail) ? room.getRecipientEmail()
				: room.getInitiatorEmail();
		notificationService.sendEvent(targetEmail, "TYPING",
				Map.of("roomId", roomId, "email", senderEmail, "isTyping", isTyping));
	}
}