package mac.prograde.api.service;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class CacheRefreshService {

    // Runs in the background every 15 seconds (15000 milliseconds)
    // Now clears the users cache every 15 seconds as well
    @Scheduled(fixedRate = 15000)
    @CacheEvict(value = { "adminMetrics", "adminCharts", "adminReports", "myReports", "users" }, allEntries = true)
    public void clearHeavyCaches() {
    }
}