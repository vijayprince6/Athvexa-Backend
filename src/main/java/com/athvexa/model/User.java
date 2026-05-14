package com.athvexa.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = true)
    private String name;
    
    @Column(name = "full_name")
    private String fullName;

    @Column(length = 500)
    private String bio;
    
    public String getUsername() {
        return username;
    }
    
    public String getName() {
        return name;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    private String gender;
    
    private String occupation;
    
    @Column(name = "occupation_name")
    private String occupationName;
    
    // Coach-specific fields
    private String role = "USER"; // USER or COACH
    
    private String sport; // Coach's sport specialization
    
    @Column(name = "academy_name")
    private String academyName; // Coaching academy name
    
    private String experience; // Years of coaching experience
    
    @Column(name = "profile_image_url")
    private String profileImageUrl;
    
    @Column(name = "avatar_url")
    private String avatarUrl;
    
    @Column(name = "total_points")
    private Integer totalPoints = 0;
    
    @Column(name = "followers_count")
    private Integer followersCount = 0;
    
    @Column(name = "following_count")
    private Integer followingCount = 0;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "auth_id")
    private UUID authId;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
    }
    
    @Override
    public String getPassword() {
        return password;
    }

    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return isActive != null ? isActive : true;
    }
}
