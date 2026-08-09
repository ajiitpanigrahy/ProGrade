package mac.prograde.api.service;

public interface OtpService {

	public void generateAndLogOtp(String email);

	public boolean validateOtp(String email, String otp);

	public void clearOtp(String email);

}
