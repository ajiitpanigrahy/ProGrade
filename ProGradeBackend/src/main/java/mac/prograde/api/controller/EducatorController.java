package mac.prograde.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import mac.prograde.api.service.StudentAssessmentService;

@RestController
@RequestMapping("/api/v1/educator") // Ensure this matches your API prefix routing
public class EducatorController {

    @Autowired
    private StudentAssessmentService studentAssessmentService;

    @GetMapping("/leaderboard")
    public ResponseEntity<?> getEducatorLeaderboard(@RequestParam(required = false, defaultValue = "ALL_TIME") String time) {
        // Pass null for studentEmail so it calculates globally without highlighting a specific user
        return ResponseEntity.ok(studentAssessmentService.getLeaderboards(null, time));
    }
}