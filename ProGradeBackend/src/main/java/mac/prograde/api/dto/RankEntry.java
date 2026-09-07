package mac.prograde.api.dto;

public class RankEntry {
    private int rank;
    private String studentName;
    private String email;
    private int rewardPoints;
    private boolean isCurrentUser;

    // Getters and Setters
    public int getRank() { return rank; }
    public void setRank(int rank) { this.rank = rank; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public int getRewardPoints() { return rewardPoints; }
    public void setRewardPoints(int rewardPoints) { this.rewardPoints = rewardPoints; }
    public boolean getIsCurrentUser() { return isCurrentUser; }
    public void setIsCurrentUser(boolean isCurrentUser) { this.isCurrentUser = isCurrentUser; }
}