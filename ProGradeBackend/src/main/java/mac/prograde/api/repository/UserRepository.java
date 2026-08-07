package mac.prograde.api.repository;

import mac.prograde.api.entity.User;
import mac.prograde.api.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    // Find a user by email (used by Auth)
    User findByEmail(String email);

    // Get all educators who are NOT yet approved
    List<User> findByRoleAndIsApprovedFalse(Role role);

    // Count how many educators are pending
    long countByRoleAndIsApprovedFalse(Role role);

    // Group users by role for the Pie Chart
    @Query("SELECT u.role, COUNT(u) FROM User u GROUP BY u.role")
    List<Object[]> countUsersByRole();
    
    boolean existsByEmail(String email); 
}