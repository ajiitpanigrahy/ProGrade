package mac.prograde.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableAsync
@EnableCaching
// Tell Spring to strictly use JPA (MySQL) for your repositories, ignoring Redis
@EnableJpaRepositories(basePackages = "mac.prograde.api.repository")
//  Silences the PageImpl warning and serializes pages safely for the frontend
public class ProGradeBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProGradeBackendApplication.class, args);
	}

}
