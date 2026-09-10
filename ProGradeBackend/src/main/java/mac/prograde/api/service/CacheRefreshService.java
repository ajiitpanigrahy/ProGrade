package mac.prograde.api.service;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class CacheRefreshService {

    // Runs in the background every 15 seconds (15000 milliseconds)
    // Now clears the users cache every 15 seconds as well
    @Scheduled(fixedRate = 15000)
    @CacheEvict(value = {"adminMetrics", "adminCharts", "systemLogs", "adminReports", "myReports", "users"}, allEntries = true)
    public void clearHeavyCaches() {
        // Spring magically clears the RAM cache. 
        // The very next user who opens the dashboard will pull fresh DB data, 
        // and then it will be cached for the next 15 seconds!
    }
}