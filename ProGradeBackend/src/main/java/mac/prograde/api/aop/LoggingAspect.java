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

@Aspect
@Component
public class LoggingAspect {

	private final Logger log = LoggerFactory.getLogger(this.getClass());

	@Autowired
	private DatabaseAuditService auditService; // 🌟 Inject the DB Writer

	@Pointcut("within(mac.prograde.api.controller..*)")
	public void controllerPointcut() {
	}

	@Pointcut("within(mac.prograde.api.service.impl..*)")
	public void servicePointcut() {
	}

	@Around("controllerPointcut() || servicePointcut()")
	public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {

		String className = joinPoint.getTarget().getClass().getSimpleName();
		String methodName = joinPoint.getSignature().getName();
		String loggerName = joinPoint.getTarget().getClass().getName();

		String actor = extractCurrentUser();
		String ipAddress = extractClientIp();

		log.info(" START: {} - User: {}", methodName, actor);

		StopWatch stopWatch = new StopWatch();
		stopWatch.start();

		Object result;
		try {
			result = joinPoint.proceed();
		} catch (Throwable e) {
			// 🌟 Write ERROR to Database
			auditService.saveLog("ERROR", loggerName, "Method failed: " + e.getMessage(), actor, ipAddress, className,
					methodName, e);
			throw e;
		} finally {
			stopWatch.stop();
			long timeTaken = stopWatch.getTotalTimeMillis();

			String msg = timeTaken > 2000 ? "🐢 SLOW EXECUTION: " + timeTaken + "ms" : " END: " + timeTaken + "ms";
			String level = timeTaken > 2000 ? "WARN" : "INFO";

			// 🌟 Write INFO/WARN to Database
			auditService.saveLog(level, loggerName, msg, actor, ipAddress, className, methodName, null);
		}

		return result;
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
				return (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) ? req.getRemoteAddr() : ip;
			}
		} catch (Exception e) {
		}
		return "INTERNAL";
	}
}