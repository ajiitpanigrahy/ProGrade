package mac.prograde.api.controller;

import lombok.RequiredArgsConstructor;
import mac.prograde.api.dto.ProfileUpdateRequest;
import mac.prograde.api.entity.User;
import mac.prograde.api.repository.UserRepository;
import mac.prograde.api.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final UserRepository userRepository;

    // 🚀 THE FIX: Bulletproof User Extraction
    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email;
        
        if (authentication.getPrincipal() instanceof UserDetails) {
            email = ((UserDetails) authentication.getPrincipal()).getUsername();
        } else {
            email = authentication.getPrincipal().toString();
        } ̰
        
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("Authenticated user not found in database.");
        }
        return user;
    }

    @PutMapping("/update")
    public ResponseEntity<User> updateProfile(@RequestBody ProfileUpdateRequest request) {
        User currentUser = getAuthenticatedUser();
        User updatedUser = profileService.updateProfile(currentUser.getId(), request);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/picture")
    public ResponseEntity<String> uploadProfilePicture(@RequestParam("file") MultipartFile file) {
        User currentUser = getAuthenticatedUser();
        String imageUrl = profileService.uploadProfilePicture(currentUser.getId(), file);
        return ResponseEntity.ok(imageUrl);
    }
}