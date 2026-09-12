package mac.prograde.api.aop;

import jakarta.servlet.http.HttpServletRequest;
import mac.prograde.api.service.DatabaseAuditService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StopWatch;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Arrays;

@Aspect
@Component
public class LoggingAspect {

	private final Logger log = LoggerFactory.getLogger(this.getClass());

	@Autowired
	private DatabaseAuditService auditService;

	// Matches all REST controllers
	@Pointcut("within(mac.prograde.api.controller..*) " +
              "&& !within(mac.prograde.api.controller.NotificationController) " +
              "&& !within(mac.prograde.api.controller.SystemHealthController)")
    public void controllerPointcut() {
    }

	// Matches all service implementations, but EXCLUDES the auditing service itself
	// to avoid infinite loops
	@Pointcut("within(mac.prograde.api.service.impl..*) && !target(mac.prograde.api.service.DatabaseAuditService)")
	public void servicePointcut() {
	}

	/**
	 * Controller Layer Interceptor: Focuses on HTTP metadata, entry/exit
	 * checkpoints, and DB Auditing.
	 */
	@Around("controllerPointcut()")
	public Object logControllerLayer(ProceedingJoinPoint joinPoint) throws Throwable {
		String className = joinPoint.getTarget().getClass().getSimpleName();
		String methodName = joinPoint.getSignature().getName();
		String loggerName = joinPoint.getTarget().getClass().getName();

		String actor = extractCurrentUser();
		String ipAddress = extractClientIp();
		String args = Arrays.toString(joinPoint.getArgs());

		log.info("🚀 API ENTRY: {}.{}() | User: {} | IP: {} | Args: {}", className, methodName, actor, ipAddress, args);

		StopWatch stopWatch = new StopWatch();
		stopWatch.start();

		Object result;
		String status = "SUCCESS";
		String message = "Execution completed successfully";
		Throwable thrownException = null;

		try {
			result = joinPoint.proceed();
			return result;
		} catch (Throwable e) {
			status = "ERROR";
			message = "API Failed: " + e.getClass().getSimpleName() + " - " + e.getMessage();
			thrownException = e;
			throw e;
		} finally {
			stopWatch.stop();
			long timeTaken = stopWatch.getTotalTimeMillis();

			// Detect performance issues dynamically
			if (timeTaken > 2000 && !"ERROR".equals(status)) {
				status = "WARN";
				message = "SLOW API DETECTED: Execution took " + timeTaken + "ms";
				log.warn("API EXIT: {}.{}() | {} | Duration: {}ms", className, methodName, message, timeTaken);
			} else if ("ERROR".equals(status)) {
				log.error("API EXIT: {}.{}() | {} | Duration: {}ms", className, methodName, message, timeTaken);
			} else {
				log.info("API EXIT: {}.{}() | Success | Duration: {}ms", className, methodName, timeTaken);
			}

			// Write to the Database once per API call sequence (at the root entry point)
			auditService.saveLog(status, loggerName, message + " (Duration: " + timeTaken + "ms)", actor, ipAddress,
					className, methodName, thrownException);
		}
	}

	/**
	 * Service Layer Interceptor: Purely text-based SLF4J tracing for internal
	 * business logic debugging. Does not write to DB to avoid performance issues
	 * and database locks.
	 */
	@Around("servicePointcut()")
	public Object logServiceLayer(ProceedingJoinPoint joinPoint) throws Throwable {
		String className = joinPoint.getTarget().getClass().getSimpleName();
		String methodName = joinPoint.getSignature().getName();

		log.debug("⚙️ SERVICE START: {}.{}()", className, methodName);

		StopWatch stopWatch = new StopWatch();
		stopWatch.start();

		try {
			Object result = joinPoint.proceed();
			stopWatch.stop();
			log.debug("SERVICE END: {}.{}() | Duration: {}ms", className, methodName, stopWatch.getTotalTimeMillis());
			return result;
		} catch (Throwable e) {
			stopWatch.stop();
			log.error("SERVICE FAILED: {}.{}() | Exception: {} | Duration: {}ms", className, methodName,
					e.getClass().getSimpleName(), stopWatch.getTotalTimeMillis());
			throw e;
		}
	}

	private String extractCurrentUser() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		return (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) ? auth.getName()
				: "SYSTEM";
	}

	private String extractClientIp() {
		try {
			ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
			if (attrs != null) {
				HttpServletRequest req = attrs.getRequest();
				String ip = req.getHeader("X-Forwarded-For");
				if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
					ip = req.getHeader("Proxy-Client-IP");
				}
				return (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) ? req.getRemoteAddr()
						: ip.split(",")[0].trim();
			}
		} catch (Exception ignored) {
		}
		return "INTERNAL";
	}
}
