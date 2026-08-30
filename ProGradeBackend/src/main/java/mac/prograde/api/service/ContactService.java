package mac.prograde.api.service;

import mac.prograde.api.dto.ContactRequest;

public interface ContactService {
	
	void processContactSubmission(ContactRequest request);

}
