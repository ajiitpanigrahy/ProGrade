package mac.prograde.api.service.impl;

import lombok.RequiredArgsConstructor;
import mac.prograde.api.dto.ProfileUpdateRequest;
import mac.prograde.api.entity.User;
import mac.prograde.api.repository.UserRepository;
import mac.prograde.api.service.ProfileService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

	private final UserRepository userRepository;

	// Directory where images will be saved locally
	private final Path fileStorageLocation = Paths.get("uploads/profiles").toAbsolutePath().normalize();

	@Override
	public User updateProfile(UUID userId, ProfileUpdateRequest request) {
		User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));

		if (request.getFullName() != null)
			user.setFullName(request.getFullName());
		if (request.getPhoneNumber() != null)
			user.setPhoneNumber(request.getPhoneNumber());
		if (request.getGender() != null)
			user.setGender(request.getGender());
		if (request.getHighestQualification() != null)
			user.setHighestQualification(request.getHighestQualification());

		return userRepository.save(user);
	}

	@Override
	public String uploadProfilePicture(UUID userId, MultipartFile file) {
		User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));

		try {
			// Create directories if they don't exist
			Files.createDirectories(this.fileStorageLocation);

			// Generate a unique file name to prevent overwriting
			String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
			String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
			String newFileName = userId.toString() + "_" + UUID.randomUUID().toString() + fileExtension;

			// Copy file to the target location
			Path targetLocation = this.fileStorageLocation.resolve(newFileName);
			Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

			// Generate the URL to access this image via HTTP
			String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
					.path("/api/v1/profile/images/").path(newFileName).toUriString();

			// Update user entity
			user.setProfilePictureUrl(fileDownloadUri);
			userRepository.save(user);

			return fileDownloadUri;

		} catch (IOException ex) {
			throw new RuntimeException("Could not store file. Please try again!", ex);
		}
	}
}