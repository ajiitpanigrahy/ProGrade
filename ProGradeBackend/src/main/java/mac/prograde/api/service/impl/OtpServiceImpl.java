package mac.prograde.api.service.impl;

import org.springframework.stereotype.Service;

import mac.prograde.api.service.OtpService;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpServiceImpl implements OtpService {
	// Thread-safe map to store email -> OTP
	private final Map<String, String> otpStorage = new ConcurrentHashMap<>();

	@Override
	public void generateAndLogOtp(String email) {
		String otp = String.format("%06d", new Random().nextInt(999999));
		otpStorage.put(email, otp);

		// Print to the backend console for you to copy during development!
		System.out.println("=================================================");
		System.out.println("🔐 OTP GENERATED FOR: " + email);
		System.out.println("🔑 YOUR OTP IS: " + otp);
		System.out.println("=================================================");
	}

	@Override
	public boolean validateOtp(String email, String otp) {
		String storedOtp = otpStorage.get(email);
		return storedOtp != null && storedOtp.equals(otp);
	}

	@Override
	public void clearOtp(String email) {
		otpStorage.remove(email);
	}
}