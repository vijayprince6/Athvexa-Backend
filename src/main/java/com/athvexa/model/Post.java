package com.athvexa.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Post {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id")
    private Long userId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "email", "authId"})
    private User user;
    
    @Column(nullable = false)
    private String description;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(name = "photo")
    private String photo;
    
    @Column(nullable = false)
    private String sport;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "level_of_achievement", nullable = false, columnDefinition = "varchar(255) default 'LOCAL_LEVEL'")
    private AchievementLevel achievementLevel;
    
    @Column(nullable = false)
    private String position;
    
    @Column(nullable = false)
    private Integer points;
    
    @Column(name = "likes_count")
    private Integer likesCount = 0;
    
    private String category;
    
    private String content;
    
    @Column(name = "auth_id")
    private UUID authId;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Transient
    private boolean likedByUser;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum AchievementLevel {
        LOCAL_LEVEL("Local Level (School / Village / Club)", 1),
        DISTRICT_LEVEL("District Level", 2),
        STATE_LEVEL("State Level", 3),
        NATIONAL_LEVEL("National Level", 4),
        INTERNATIONAL_LEVEL("International Level", 5),
        OLYMPICS_LEVEL("Olympics Level", 6);
        
        private final String displayName;
        private final int level;
        
        AchievementLevel(String displayName, int level) {
            this.displayName = displayName;
            this.level = level;
        }
        
        public String getDisplayName() {
            return displayName;
        }
        
        public int getLevel() {
            return level;
        }
    }
}
