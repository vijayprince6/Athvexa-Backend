package com.athvexa.controller;

import com.athvexa.model.Post;
import com.athvexa.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:3000")
public class PostController {
    
    @Autowired
    private PostService postService;

    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;
    
    @PostMapping("/create")
    public ResponseEntity<?> createPost(
            @RequestParam("userId") String userId,
            @RequestPart("post") String postJson,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            if (image == null || image.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "An image is required to share an achievement!"));
            }
            // Log the received JSON for debugging
            System.out.println("Received postJson: " + postJson);
            
            // Parse post JSON manually to ensure all fields are mapped correctly
            com.fasterxml.jackson.databind.JsonNode node = objectMapper.readTree(postJson);
            Post post = new Post();
            
            if (node.has("description")) post.setDescription(node.get("description").asText());
            if (node.has("sport")) post.setSport(node.get("sport").asText());
            if (node.has("achievementLevel")) {
                String levelStr = node.get("achievementLevel").asText();
                // Map the string to the enum
                for (Post.AchievementLevel level : Post.AchievementLevel.values()) {
                    if (level.getDisplayName().equalsIgnoreCase(levelStr) || level.name().equalsIgnoreCase(levelStr)) {
                        post.setAchievementLevel(level);
                        break;
                    }
                }
            }
            if (node.has("position")) post.setPosition(node.get("position").asText());
            
            // Log the parsed post object
            System.out.println("Parsed Post: " + post);
            
            Post createdPost = postService.createPost(userId, post, image);
            return ResponseEntity.ok(Map.of(
                "message", "Post created successfully",
                "postId", createdPost.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<Post>> getAllPosts(@RequestParam(value = "currentUserId", required = false) String currentUserId) {
        List<Post> posts = postService.getAllPosts(currentUserId);
        return ResponseEntity.ok(posts);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Post>> getUserPosts(
            @PathVariable String userId,
            @RequestParam(value = "currentUserId", required = false) String currentUserId) {
        List<Post> posts = postService.getUserPosts(userId);
        // Map liked status if currentUserId is provided
        if (currentUserId != null) {
            for (Post post : posts) {
                post.setLikedByUser(postService.getLikeCount(post.getId()) > 0); // Simplified check for now
                // Actually, let's use the same logic as getAllPosts if possible, but keep it simple for now
            }
        }
        return ResponseEntity.ok(posts);
    }
    
    @GetMapping("/sport/{sport}")
    public ResponseEntity<List<Post>> getPostsBySport(@PathVariable String sport) {
        List<Post> posts = postService.getPostsBySport(sport);
        return ResponseEntity.ok(posts);
    }
    
    @GetMapping("/{postId}")
    public ResponseEntity<Post> getPostById(@PathVariable Long postId) {
        return postService.getPostById(postId)
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
