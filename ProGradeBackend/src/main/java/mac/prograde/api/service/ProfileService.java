package mac.prograde.api.service;

import mac.prograde.api.dto.ProfileUpdateRequest;
import mac.prograde.api.entity.User;
import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;

public interface ProfileService {
	User updateProfile(UUID userId, ProfileUpdateRequest request);

	String uploadProfilePicture(UUID userId, MultipartFile file);
}