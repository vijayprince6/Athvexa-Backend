package com.athvexa.repository;

import com.athvexa.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByUsername(String username);
    
    boolean existsByEmail(String email);
    
    boolean existsByUsername(String username);
    
    @Query("SELECT u FROM User u WHERE u.name LIKE %:name% OR u.username LIKE %:username%")
    List<User> findByNameContainingOrUsernameContaining(@Param("name") String name, @Param("username") String username);
    
    @Query("SELECT u FROM User u WHERE u.totalPoints > 0 ORDER BY u.totalPoints DESC")
    List<User> findUsersWithPointsOrderByPointsDesc();
    
    @Query("SELECT u FROM User u WHERE u.totalPoints > 0 AND u.occupation = :occupation ORDER BY u.totalPoints DESC")
    List<User> findUsersByOccupationWithPointsOrderByPointsDesc(@Param("occupation") String occupation);
    
    @Query("SELECT u FROM User u WHERE u.totalPoints > 0 AND u.occupation = :occupation AND u.gender = :gender ORDER BY u.totalPoints DESC")
    List<User> findUsersByOccupationAndGenderWithPointsOrderByPointsDesc(@Param("occupation") String occupation, @Param("gender") String gender);
    
    @Query("SELECT SUM(p.points) FROM Post p WHERE p.userId = :userId")
    Integer calculateTotalPointsByUserId(@Param("userId") Long userId);
    
    @Query("SELECT u FROM User u WHERE u.role = 'COACH' AND u.sport = :sport ORDER BY u.totalPoints DESC")
    List<User> findCoachesBySport(@Param("sport") String sport);
}
