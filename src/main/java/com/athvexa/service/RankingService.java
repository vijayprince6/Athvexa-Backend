package com.athvexa.service;

import com.athvexa.dto.UserDTO;
import com.athvexa.model.Post;
import com.athvexa.model.User;
import com.athvexa.repository.PostRepository;
import com.athvexa.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RankingService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PostRepository postRepository;

    @jakarta.annotation.PostConstruct
    public void init() {
        // Sync points on startup to fix any inconsistencies
        updateAllUserPoints();
    }
    
    public List<UserDTO> getAllRankings() {
        List<User> users = userRepository.findUsersWithPointsOrderByPointsDesc();
        return users.stream()
                .map(this::convertToUserDTO)
                .collect(Collectors.toList());
    }
    
    public List<UserDTO> getRankingsBySport(String sport) {
        List<Post> posts = postRepository.findBySportOrderByPointsDesc(sport);
        
        return posts.stream()
                .map(Post::getUser)
                .distinct()
                .filter(user -> user.getTotalPoints() != null && user.getTotalPoints() > 0)
                .map(this::convertToUserDTO)
                .collect(Collectors.toList());
    }
    
    public List<UserDTO> getRankingsByOccupation(String occupation) {
        List<User> users = userRepository.findUsersByOccupationWithPointsOrderByPointsDesc(occupation);
        return users.stream()
                .map(this::convertToUserDTO)
                .collect(Collectors.toList());
    }
    
    public List<UserDTO> getRankingsByOccupationAndGender(String occupation, String gender) {
        List<User> users = userRepository.findUsersByOccupationAndGenderWithPointsOrderByPointsDesc(occupation, gender);
        return users.stream()
                .map(this::convertToUserDTO)
                .collect(Collectors.toList());
    }
    
    public List<UserDTO> getRankingsByGender(String gender) {
        List<User> allUsers = userRepository.findUsersWithPointsOrderByPointsDesc();
        return allUsers.stream()
                .filter(user -> user.getGender().equals(gender))
                .map(this::convertToUserDTO)
                .collect(Collectors.toList());
    }
    
    public UserDTO getUserRanking(String userId) {
        User user = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToUserDTO(user);
    }
    
    public Integer getUserRankPosition(String userId) {
        List<User> allUsers = userRepository.findUsersWithPointsOrderByPointsDesc();
        
        for (int i = 0; i < allUsers.size(); i++) {
            if (allUsers.get(i).getId().equals(Long.parseLong(userId))) {
                return i + 1;
            }
        }
        
        return null;
    }
    
    public List<String> getAllSports() {
        List<Post> posts = postRepository.findAll();
        return posts.stream()
                .map(Post::getSport)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }
    
    public boolean isEmptyRankings() {
        return userRepository.findUsersWithPointsOrderByPointsDesc().isEmpty();
    }
    
    public void updateAllUserPoints() {
        List<User> users = userRepository.findAll();
        
        for (User user : users) {
            Integer totalPoints = userRepository.calculateTotalPointsByUserId(user.getId());
            int newPoints = totalPoints != null ? totalPoints : 0;
            System.out.println("Syncing points for user " + user.getUsername() + ": " + user.getTotalPoints() + " -> " + newPoints);
            user.setTotalPoints(newPoints);
            userRepository.save(user);
        }
    }
    
    private UserDTO convertToUserDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setUsername(user.getUsername());
        dto.setDateOfBirth(user.getDateOfBirth());
        dto.setGender(user.getGender());
        dto.setOccupation(user.getOccupation());
        dto.setOccupationName(user.getOccupationName());
        dto.setProfileImageUrl(user.getProfileImageUrl());
        dto.setTotalPoints(user.getTotalPoints());
        dto.setIsActive(user.getIsActive());
        dto.setPostCount(0); // Default value, will be updated in service
        return dto;
    }
}
