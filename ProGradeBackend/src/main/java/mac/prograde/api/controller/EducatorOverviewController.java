package mac.prograde.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import mac.prograde.api.dto.EducatorDashboardCharts;
import mac.prograde.api.dto.EducatorOverviewKpis;
import mac.prograde.api.service.EducatorAnalyticsService;

@RestController
@RequestMapping("/api/educator/overview")
public class EducatorOverviewController {

    @Autowired
    private EducatorAnalyticsService analyticsService;

    @GetMapping("/kpis")
    public ResponseEntity<EducatorOverviewKpis> getKpis() {
        return ResponseEntity.ok(analyticsService.calculateKpis());
    }

    @GetMapping("/charts")
    public ResponseEntity<EducatorDashboardCharts> getCharts() {
        return ResponseEntity.ok(analyticsService.calculateCharts());
    }
}