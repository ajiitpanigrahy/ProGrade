package mac.prograde.api.dto;

import lombok.Data;

@Data
public class ContactRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String message;
}