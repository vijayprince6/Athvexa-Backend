package com.athvexa.service;

import com.athvexa.model.Post;
import com.athvexa.model.User;
import com.athvexa.repository.PostRepository;
import com.athvexa.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
public class PostService {
    
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ImageUploadService imageUploadService;
    
    @Autowired
    private UserService userService;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @jakarta.annotation.PostConstruct
    public void init() {
        // List of statements to clean up old schema constraints
        String[] cleanUpStatements = {
            "ALTER TABLE posts DROP COLUMN IF EXISTS achievement_level CASCADE",
            "ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_position_check",
            "ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_achievement_level_check",
            "ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_level_of_achievement_check",
            "ALTER TABLE likes DROP CONSTRAINT IF EXISTS likes_user_id_post_id_key",
            "ALTER TABLE likes DROP CONSTRAINT IF EXISTS unique_user_post_like",
            "ALTER TABLE likes DROP COLUMN IF EXISTS user_id CASCADE",
            "ALTER TABLE likes ADD COLUMN user_id bigint",
            "ALTER TABLE likes ADD CONSTRAINT unique_user_post_like UNIQUE (user_id, post_id)",
            "DELETE FROM posts WHERE image_url IS NULL OR image_url = ''",
            "TRUNCATE TABLE likes CASCADE",
            "UPDATE posts SET likes_count = 0"
        };

        for (String sql : cleanUpStatements) {
            try {
                jdbcTemplate.execute(sql);
                System.out.println("Executed: " + sql);
            } catch (Exception e) {
                System.out.println("Note: Could not execute [" + sql + "]: " + e.getMessage());
            }
        }
        System.out.println("Schema cleanup completed.");
    }
    
    public Post createPost(String userId, Post post, MultipartFile image) throws Exception {
        User user = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Calculate points based on achievement level and position
        Integer positionValue = getPositionValue(post.getPosition());
        Integer points = PointsCalculator.calculatePoints(
            post.getAchievementLevel() != null ? post.getAchievementLevel().getDisplayName() : null, 
            positionValue
        );
        
        post.setUserId(user.getId());
        post.setPoints(points);
        
        // Upload image if provided
        if (image != null && !image.isEmpty()) {
            var uploadResult = imageUploadService.uploadImage(image);
            post.setImageUrl((String) uploadResult.get("image_url"));
        }
        
        // Update user's total points
        userService.updateUserPoints(userId, points);
        
        return postRepository.save(post);
    }

    @Autowired
    private com.athvexa.repository.LikeRepository likeRepository;

    public List<Post> getAllPosts(String currentUserId) {
        List<Post> posts = postRepository.findAllByOrderByCreatedAtDesc();
        if (currentUserId != null) {
            Long uId = Long.parseLong(currentUserId);
            for (Post post : posts) {
                post.setLikedByUser(likeRepository.findByUserIdAndPostId(uId, post.getId()) != null);
            }
        }
        return posts;
    }

    public List<Post> getAllPosts() {
        return getAllPosts(null);
    }
    
    public List<Post> getUserPosts(String userId) {
        return postRepository.findByUserIdOrderByCreatedAtDesc(Long.parseLong(userId));
    }
    
    public List<Post> getPostsBySport(String sport) {
        return postRepository.findBySportOrderByPointsDesc(sport);
    }
    
    public Optional<Post> getPostById(Long postId) {
        return postRepository.findById(postId);
    }
    
    public void deletePost(Long postId, String userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        if (!post.getUserId().toString().equals(userId)) {
            throw new RuntimeException("You can only delete your own posts");
        }
        
        // Decrement user's total points
        userService.updateUserPoints(userId, -post.getPoints());
        
        postRepository.delete(post);
    }
    
    public Integer getLikeCount(Long postId) {
        return postRepository.countLikesByPostId(postId);
    }
    
    private Integer getPositionValue(String position) {
        if (position == null) return 4; // Default to participation
        
        switch (position.toUpperCase()) {
            case "1":
            case "FIRST":
                return 1;
            case "2":
            case "SECOND":
                return 2;
            case "3":
            case "THIRD":
                return 3;
            case "4":
            case "PARTICIPATION":
                return 4;
            default:
                return 4; // Default to participation
        }
    }
}
