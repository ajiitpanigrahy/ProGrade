package mac.prograde.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardDTO {
    
    private List<RankEntry> globalLeaderboard;
    private List<CategoryLeaderboard> technologyLeaderboards;
    private List<CategoryLeaderboard> assessmentLeaderboards;
    private List<CategoryLeaderboard> batchLeaderboards; // 🌟 ADDED FOR BATCHES

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class CategoryLeaderboard {
        private String categoryName; 
        private List<RankEntry> rankings;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class RankEntry {
        private int rank;
        private String studentName;
        private String email;
        private long rewardPoints;
        private boolean isCurrentUser;
    }
}