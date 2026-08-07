package mac.prograde.api.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String fullName;
    private String phoneNumber;
    private String gender;
    private String highestQualification;
}