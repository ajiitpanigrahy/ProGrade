package mac.prograde.api.dto;

import java.util.List;

public class LeaderboardData {
    private List<RankEntry> globalLeaderboard;
    private List<CategoryLeaderboard> technologyLeaderboards;
    private List<CategoryLeaderboard> assessmentLeaderboards;
    private List<CategoryLeaderboard> batchLeaderboards;

    // Getters and Setters
    public List<RankEntry> getGlobalLeaderboard() { return globalLeaderboard; }
    public void setGlobalLeaderboard(List<RankEntry> globalLeaderboard) { this.globalLeaderboard = globalLeaderboard; }
    public List<CategoryLeaderboard> getTechnologyLeaderboards() { return technologyLeaderboards; }
    public void setTechnologyLeaderboards(List<CategoryLeaderboard> technologyLeaderboards) { this.technologyLeaderboards = technologyLeaderboards; }
    public List<CategoryLeaderboard> getAssessmentLeaderboards() { return assessmentLeaderboards; }
    public void setAssessmentLeaderboards(List<CategoryLeaderboard> assessmentLeaderboards) { this.assessmentLeaderboards = assessmentLeaderboards; }
    public List<CategoryLeaderboard> getBatchLeaderboards() { return batchLeaderboards; }
    public void setBatchLeaderboards(List<CategoryLeaderboard> batchLeaderboards) { this.batchLeaderboards = batchLeaderboards; }
}