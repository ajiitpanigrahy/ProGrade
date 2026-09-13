package mac.prograde.api.service;

import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import mac.prograde.api.dto.ProfileUpdateRequest;
import mac.prograde.api.entity.User;

public interface ProfileService {
	User updateProfile(UUID userId, ProfileUpdateRequest request);

	String uploadProfilePicture(UUID userId, MultipartFile file);
}