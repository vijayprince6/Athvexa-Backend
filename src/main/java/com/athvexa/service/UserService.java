package com.athvexa.service;

import com.athvexa.model.User;
import com.athvexa.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        // Auto-generate username from email if not provided
        String generatedUsername = user.getEmail().split("@")[0];
        String finalUsername = generatedUsername;
        int counter = 1;
        while (userRepository.existsByUsername(finalUsername)) {
            finalUsername = generatedUsername + counter;
            counter++;
        }
        user.setUsername(finalUsername);
        
        // Set default name to avoid constraint violation
        if (user.getName() == null) {
            user.setName("User");
        }
        
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
    
    public boolean verifyPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    public User updateUser(String userId, User userDetails) {
        User user = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setName(userDetails.getName());
        user.setFullName(userDetails.getName()); // Sync fullName with name
        user.setUsername(userDetails.getUsername());
        user.setDateOfBirth(userDetails.getDateOfBirth());
        user.setGender(userDetails.getGender());
        user.setOccupation(userDetails.getOccupation());
        user.setOccupationName(userDetails.getOccupationName());
        user.setProfileImageUrl(userDetails.getProfileImageUrl());
        user.setBio(userDetails.getBio());
        
        return userRepository.save(user);
    }
    
    public void updateUserPoints(String userId, Integer points) {
        User user = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setTotalPoints(user.getTotalPoints() + points);
        userRepository.save(user);
    }
    
    public List<User> searchUsers(String query) {
        return userRepository.findByNameContainingOrUsernameContaining(query, query);
    }
    
    public List<User> getUsersWithPoints() {
        return userRepository.findUsersWithPointsOrderByPointsDesc();
    }
    
    public List<User> getUsersByOccupation(String occupation) {
        return userRepository.findUsersByOccupationWithPointsOrderByPointsDesc(occupation);
    }
    
    public List<User> getUsersByOccupationAndGender(String occupation, String gender) {
        return userRepository.findUsersByOccupationAndGenderWithPointsOrderByPointsDesc(occupation, gender);
    }
}
