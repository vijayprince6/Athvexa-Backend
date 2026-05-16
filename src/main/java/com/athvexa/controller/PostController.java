package com.athvexa.controller;

import com.athvexa.model.Post;
import com.athvexa.service.PostService;
import com.athvexa.service.OCRService;
import com.athvexa.service.AchievementValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    
    @Autowired
    private PostService postService;
    
    @Autowired
    private OCRService ocrService;
    
    @Autowired
    private AchievementValidationService validationService;
    
    @PostMapping("/create")
    public ResponseEntity<?> createPost(
            @RequestParam("userId") String userId,
            @RequestParam("description") String description,
            @RequestParam("sport") String sport,
            @RequestParam("achievementLevel") String achievementLevel,
            @RequestParam("position") String position,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            if (image == null || image.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "An image is required to share an achievement!"));
            }
            
            // Log for debugging
            System.out.println("Creating post for user: " + userId);
            System.out.println("Sport: " + sport + ", Level: " + achievementLevel + ", Position: " + position);
            
            Post post = new Post();
            post.setDescription(description);
            post.setSport(sport);
            post.setPosition(position);
            
            // Map the string to the enum more robustly
            boolean levelSet = false;
            for (Post.AchievementLevel level : Post.AchievementLevel.values()) {
                if (level.name().equalsIgnoreCase(achievementLevel) || 
                    level.getDisplayName().equalsIgnoreCase(achievementLevel) ||
                    achievementLevel.toLowerCase().contains(level.name().toLowerCase().split("_")[0])) {
                    post.setAchievementLevel(level);
                    levelSet = true;
                    break;
                }
            }
            
            // Fallback for frontend values like 'district', 'state', etc.
            if (!levelSet) {
                if (achievementLevel.equalsIgnoreCase("district")) post.setAchievementLevel(Post.AchievementLevel.DISTRICT_LEVEL);
                else if (achievementLevel.equalsIgnoreCase("state")) post.setAchievementLevel(Post.AchievementLevel.STATE_LEVEL);
                else if (achievementLevel.equalsIgnoreCase("national")) post.setAchievementLevel(Post.AchievementLevel.NATIONAL_LEVEL);
                else if (achievementLevel.equalsIgnoreCase("international")) post.setAchievementLevel(Post.AchievementLevel.INTERNATIONAL_LEVEL);
                else if (achievementLevel.equalsIgnoreCase("school")) post.setAchievementLevel(Post.AchievementLevel.LOCAL_LEVEL);
                else if (achievementLevel.equalsIgnoreCase("college")) post.setAchievementLevel(Post.AchievementLevel.LOCAL_LEVEL);
                else if (achievementLevel.equalsIgnoreCase("club")) post.setAchievementLevel(Post.AchievementLevel.LOCAL_LEVEL);
                else post.setAchievementLevel(Post.AchievementLevel.LOCAL_LEVEL);
            }
            
            Post createdPost = postService.createPost(userId, post, image);
            return ResponseEntity.ok(Map.of(
                "message", "Post created successfully",
                "postId", createdPost.getId()
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/validate-achievement")
    public ResponseEntity<?> validateAchievement(
            @RequestParam("sport") String sport,
            @RequestParam("achievementLevel") String achievementLevel,
            @RequestParam("position") String position,
            @RequestParam("image") MultipartFile image) {
        try {
            System.out.println("Validating achievement - Sport: " + sport + ", Level: " + achievementLevel + ", Position: " + position);
            
            // Extract text from image using OCR
            String extractedText = ocrService.extractTextFromImage(image);
            System.out.println("Extracted text: " + extractedText);
            
            // Validate the achievement
            AchievementValidationService.ValidationResult validationResult = 
                validationService.validateAchievement(extractedText, sport, achievementLevel, position);
            
            if (validationResult.isValid()) {
                return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "message", validationResult.getMessage()
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "valid", false,
                    "message", validationResult.getMessage(),
                    "reason", validationResult.getReason()
                ));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "valid", false,
                "message", "Error validating achievement: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/all")
    public ResponseEntity<?> getAllPosts(@RequestParam(value = "currentUserId", required = false) String currentUserId) {
        try {
            List<Post> posts = postService.getAllPosts(currentUserId);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("message", "Error fetching posts: " + e.getMessage()));
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserPosts(
            @PathVariable String userId,
            @RequestParam(value = "currentUserId", required = false) String currentUserId) {
        try {
            List<Post> posts = postService.getUserPosts(userId, currentUserId);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            System.err.println("Error fetching user posts: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Error loading posts: " + e.getMessage()));
        }
    }
    
    @GetMapping("/sport/{sport}")
    public ResponseEntity<List<Post>> getPostsBySport(
            @PathVariable String sport,
            @RequestParam(value = "currentUserId", required = false) String currentUserId) {
        List<Post> posts = postService.getPostsBySport(sport, currentUserId);
        return ResponseEntity.ok(posts);
    }
    
    @GetMapping("/{postId}")
    public ResponseEntity<Post> getPostById(
            @PathVariable Long postId,
            @RequestParam(value = "currentUserId", required = false) String currentUserId) {
        return postService.getPostById(postId, currentUserId)
                .map(post -> ResponseEntity.ok(post))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(
            @PathVariable Long postId,
            @RequestParam("userId") String userId) {
        try {
            postService.deletePost(postId, userId);
            return ResponseEntity.ok(Map.of("message", "Post deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/{postId}/likes/count")
    public ResponseEntity<Integer> getLikeCount(@PathVariable Long postId) {
        Integer likeCount = postService.getLikeCount(postId);
        return ResponseEntity.ok(likeCount);
    }
}
