package com.athvexa.service;

import com.athvexa.dto.UserDTO;
import com.athvexa.model.Post;
import com.athvexa.model.User;
import com.athvexa.repository.PostRepository;
import com.athvexa.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class RankingService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    public List<UserDTO> getAllRankings() {
        try {
            List<User> users = userRepository.findUsersWithPointsOrderByPointsDesc();
            if (users.isEmpty()) return Collections.emptyList();

            // Super-Link Logic: Exhaustive search for sports
            List<Post> allPosts = postRepository.findAll();
            Map<Long, List<String>> userSportsMap = new HashMap<>();
            
            if (allPosts != null) {
                for (Post p : allPosts) {
                    Long uid = p.getUserId();
                    // Double-check relationship if direct ID is null
                    if (uid == null && p.getUser() != null) {
                        uid = p.getUser().getId();
                    }
                    
                    if (uid != null) {
                        String sportName = p.getSport();
                        if (sportName != null && !sportName.trim().isEmpty()) {
                            String formattedSport = formatSportName(sportName);
                            userSportsMap.computeIfAbsent(uid, k -> new ArrayList<>()).add(formattedSport);
                        }
                    }
                }
            }

            return users.stream()
                    .filter(user -> user != null)
                    .map(user -> {
                        UserDTO dto = UserDTO.fromEntity(user);
                        Long userId = user.getId();
                        
                        // Try to get sports from our pre-built map
                        List<String> sports = userSportsMap.getOrDefault(userId, new ArrayList<>())
                                .stream().distinct().collect(Collectors.toList());
                        
                        // Fallback: If map is empty but user has points, do a direct lookup as a last resort
                        if (sports.isEmpty() && user.getTotalPoints() != null && user.getTotalPoints() > 0) {
                            List<Post> userPosts = postRepository.findByUserIdOrderByCreatedAtDesc(userId);
                            sports = userPosts.stream()
                                    .map(p -> formatSportName(p.getSport()))
                                    .filter(s -> !s.equals("General"))
                                    .distinct()
                                    .collect(Collectors.toList());
                        }
                        
                        dto.setSport(sports.isEmpty() ? "General" : String.join(", ", sports));
                        return dto;
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error in getAllRankings: " + e.getMessage());
            throw e;
        }
    }

    public List<UserDTO> getRankingsBySport(String sport) {
        try {
            List<Post> posts = postRepository.findBySportOrderByPointsDesc(sport);

            // Even when filtering by sport, we should show the actual sport name from the posts
            // to handle casing differences or multiple sports
            return posts.stream()
                    .map(Post::getUser)
                    .filter(user -> user != null)
                    .distinct()
                    .filter(user -> user.getTotalPoints() != null && user.getTotalPoints() > 0)
                    .map(user -> {
                        UserDTO dto = UserDTO.fromEntity(user);
                        return populateSports(dto, user.getId());
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error in getRankingsBySport: " + e.getMessage());
            throw e;
        }
    }

    private String formatSportName(String sport) {
        if (sport == null || sport.trim().isEmpty()) return "General";
        
        String s = sport.trim();
        if (s.equalsIgnoreCase("tabletennis")) return "Table Tennis";
        if (s.equalsIgnoreCase("athletics")) return "Athletics";
        if (s.equalsIgnoreCase("icehockey")) return "Ice Hockey";
        if (s.equalsIgnoreCase("horseriding")) return "Horse Riding";
        if (s.equalsIgnoreCase("basketball")) return "Basketball";
        if (s.equalsIgnoreCase("badminton")) return "Badminton";
        if (s.equalsIgnoreCase("football")) return "Football";
        if (s.equalsIgnoreCase("cricket")) return "Cricket";
        if (s.equalsIgnoreCase("volleyball")) return "Volleyball";
        if (s.equalsIgnoreCase("handball")) return "Handball";
        if (s.equalsIgnoreCase("kabaddi")) return "Kabaddi";
        
        if (s.length() < 2) return s.toUpperCase();
        
        // Default capitalization: First letter upper, rest lower
        return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase();
    }

    public List<UserDTO> getRankingsByOccupation(String occupation) {
        return userRepository.findUsersByOccupationWithPointsOrderByPointsDesc(occupation)
                .stream()
                .filter(user -> user != null)
                .map(user -> {
                    UserDTO dto = UserDTO.fromEntity(user);
                    return populateSports(dto, user.getId());
                })
                .collect(Collectors.toList());
    }

    public List<UserDTO> getRankingsByOccupationAndGender(String occupation, String gender) {
        return userRepository.findUsersByOccupationAndGenderWithPointsOrderByPointsDesc(occupation, gender)
                .stream()
                .filter(user -> user != null)
                .map(user -> {
                    UserDTO dto = UserDTO.fromEntity(user);
                    return populateSports(dto, user.getId());
                })
                .collect(Collectors.toList());
    }

    public List<UserDTO> getRankingsByGender(String gender) {
        return userRepository.findUsersWithPointsOrderByPointsDesc()
                .stream()
                .filter(user -> user != null && gender.equalsIgnoreCase(user.getGender()))
                .map(user -> {
                    UserDTO dto = UserDTO.fromEntity(user);
                    return populateSports(dto, user.getId());
                })
                .collect(Collectors.toList());
    }

    private UserDTO populateSports(UserDTO dto, Long userId) {
        List<String> sports = postRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(p -> formatSportName(p.getSport()))
                .filter(s -> s != null && !s.isEmpty())
                .distinct()
                .collect(Collectors.toList());
        dto.setSport(sports.isEmpty() ? "General" : String.join(", ", sports));
        return dto;
    }

    public UserDTO getUserRanking(String userId) {
        User user = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserDTO dto = UserDTO.fromEntity(user);
        return populateSports(dto, user.getId());
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
}
