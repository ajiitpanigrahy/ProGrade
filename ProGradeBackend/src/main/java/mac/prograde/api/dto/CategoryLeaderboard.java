package mac.prograde.api.dto;

import java.util.List;

public class CategoryLeaderboard {
    private String categoryName;
    private List<RankEntry> rankings;

    public CategoryLeaderboard(String categoryName, List<RankEntry> rankings) {
        this.categoryName = categoryName;
        this.rankings = rankings;
    }

    // Getters and Setters
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public List<RankEntry> getRankings() { return rankings; }
    public void setRankings(List<RankEntry> rankings) { this.rankings = rankings; }
}