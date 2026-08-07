package mac.prograde.api.aop;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StopWatch;

/**
 * Aspect for tracking and logging the execution time of API controllers and services.
 * This keeps logging logic entirely separated from business logic.
 */
@Aspect
@Component
public class LoggingAspect {

    private final Logger log = LoggerFactory.getLogger(this.getClass());

    /**
     * Pointcut that targets all methods within the controller package.
     */
    @Pointcut("within(mac.prograde.api.controller..*)")
    public void controllerPointcut() {
        // Method is empty as this is just a Pointcut declaration
    }

    /**
     * Pointcut that targets all methods within the service package.
     */
    @Pointcut("within(mac.prograde.api.service.impl..*)")
    public void servicePointcut() {
        // Method is empty as this is just a Pointcut declaration
    }

    /**
     * The @Around advice intercepts the method execution.
     * It logs the start of the method, measures how long it takes to run,
     * and logs the end along with the total execution time in milliseconds.
     */
    @Around("controllerPointcut() || servicePointcut()")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {

        // 1. Get the class name and method name being intercepted
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        String identifier = className + "." + methodName;

        log.info("▶️ START: Executing method '{}'", identifier);

        // 2. Start the stopwatch
        StopWatch stopWatch = new StopWatch();
        stopWatch.start();

        Object result;
        try {
            // 3. Proceed with the actual method execution
            result = joinPoint.proceed();
        } catch (IllegalArgumentException e) {
            // Log known business exceptions gracefully
            log.warn("⚠️ WARN: Method '{}' threw IllegalArgumentException: {}", identifier, e.getMessage());
            throw e;
        } catch (Throwable e) {
            // Log unexpected errors
            log.error("❌ ERROR: Method '{}' threw exception: {}", identifier, e.getMessage());
            throw e;
        } finally {
            // 4. Stop the stopwatch
            stopWatch.stop();
            long timeTaken = stopWatch.getTotalTimeMillis();

            // 5. Log the execution time
            log.info("⏹️ END: Method '{}' executed in {} ms", identifier, timeTaken);
        }

        return result;
    }
}