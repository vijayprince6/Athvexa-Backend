package com.athvexa.dto;

import com.athvexa.model.User;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    
    private Long id;
    private String email;
    private String name;
    private String username;
    private LocalDate dateOfBirth;
    private String gender;
    private String occupation;
    private String occupationName;
    private String profileImageUrl;
    private Integer totalPoints;
    private Boolean isActive;
    private Integer postCount;
    
    public static UserDTO fromEntity(User user) {
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
    
    public User toEntity() {
        User user = new User();
        user.setId(this.id);
        user.setEmail(this.email);
        user.setName(this.name);
        user.setUsername(this.username);
        user.setDateOfBirth(this.dateOfBirth);
        user.setGender(this.gender);
        user.setOccupation(this.occupation);
        user.setOccupationName(this.occupationName);
        user.setProfileImageUrl(this.profileImageUrl);
        user.setTotalPoints(this.totalPoints);
        user.setIsActive(this.isActive);
        return user;
    }
}
