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

    public List<UserDTO> getAllRankings() {
        List<User> users = userRepository.findUsersWithPointsOrderByPointsDesc();
        return users.stream().map(this::convertToUserDTO).collect(Collectors.toList());
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
        return userRepository.findUsersByOccupationWithPointsOrderByPointsDesc(occupation)
                .stream()
                .map(this::convertToUserDTO)
                .collect(Collectors.toList());
    }

    public List<UserDTO> getRankingsByOccupationAndGender(String occupation, String gender) {
        return userRepository.findUsersByOccupationAndGenderWithPointsOrderByPointsDesc(occupation, gender)
                .stream()
                .map(this::convertToUserDTO)
                .collect(Collectors.toList());
    }

    public List<UserDTO> getRankingsByGender(String gender) {
        return userRepository.findUsersWithPointsOrderByPointsDesc()
                .stream()
                .filter(user -> gender.equalsIgnoreCase(user.getGender()))
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
        return postRepository.findAll()
                .stream()
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
        dto.setPostCount(0);
        return dto;
    }
}
