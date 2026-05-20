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



    // Initial cleanup is no longer needed
    // Removed @PostConstruct init() method that was deleting posts and truncating likes
    
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

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<Post> getAllPosts(String currentUserId) {
        try {
            System.out.println("DEBUG: Fetching all posts. currentUserId: " + currentUserId);
            List<Post> posts = postRepository.findAllByOrderByCreatedAtDesc();
            System.out.println("DEBUG: Found " + posts.size() + " posts in database");
            
            Long uId = null;
            if (currentUserId != null && !currentUserId.isEmpty() && !currentUserId.equals("null") && !currentUserId.equals("undefined")) {
                try {
                    uId = Long.parseLong(currentUserId);
                } catch (NumberFormatException e) {
                    System.err.println("DEBUG: Invalid currentUserId format: " + currentUserId);
                }
            }

            // Optimization: Fetch all liked post IDs for this user in one query
            java.util.Set<Long> likedPostIds = new java.util.HashSet<>();
            if (uId != null) {
                likedPostIds.addAll(likeRepository.findPostIdsByUserId(uId));
            }

            for (Post post : posts) {
                try {
                    // Check for likes using the optimized set
                    if (uId != null) {
                        post.setLikedByUser(likedPostIds.contains(post.getId()));
                    }
                    
                    // Defensive check: if user is missing but userId is present
                    if (post.getUser() == null && post.getUserId() != null) {
                        System.err.println("DEBUG: Post " + post.getId() + " has userId " + post.getUserId() + " but user entity is null");
                    }
                } catch (Exception postEx) {
                    System.err.println("DEBUG: Error processing post " + post.getId() + ": " + postEx.getMessage());
                }
            }
            return posts;
        } catch (Exception e) {
            System.err.println("CRITICAL ERROR in getAllPosts: " + e.getMessage());
            e.printStackTrace();
            return new java.util.ArrayList<>(); 
        }
    }

    public List<Post> getAllPosts() {
        return getAllPosts(null);
    }
    
    public List<Post> getUserPosts(String userId) {
        return getUserPosts(userId, null);
    }
    
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<Post> getUserPosts(String userId, String currentUserId) {
        try {
            Long targetId = Long.parseLong(userId);
            System.out.println("DEBUG: Fetching posts for user: " + targetId);
            List<Post> posts = postRepository.findByUserIdOrderByCreatedAtDesc(targetId);
            System.out.println("DEBUG: Found " + posts.size() + " posts for user " + targetId);
            
            Long uId = null;
            if (currentUserId != null && !currentUserId.isEmpty() && !currentUserId.equals("null") && !currentUserId.equals("undefined")) {
                try {
                    uId = Long.parseLong(currentUserId);
                } catch (NumberFormatException e) {
                    // Ignore
                }
            }

            if (uId != null && !posts.isEmpty()) {
                java.util.Set<Long> likedPostIds = new java.util.HashSet<>(likeRepository.findPostIdsByUserId(uId));
                for (Post post : posts) {
                    post.setLikedByUser(likedPostIds.contains(post.getId()));
                }
            }
            return posts;
        } catch (NumberFormatException e) {
            System.err.println("DEBUG: Invalid userId format for getUserPosts: " + userId);
            return new java.util.ArrayList<>();
        } catch (Exception e) {
            System.err.println("DEBUG: Error in getUserPosts: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error fetching user posts: " + e.getMessage());
        }
    }
    
    public List<Post> getPostsBySport(String sport) {
        return getPostsBySport(sport, null);
    }
    
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<Post> getPostsBySport(String sport, String currentUserId) {
        List<Post> posts = postRepository.findBySportOrderByPointsDesc(sport);
        
        Long uId = null;
        if (currentUserId != null && !currentUserId.isEmpty() && !currentUserId.equals("null") && !currentUserId.equals("undefined")) {
            try {
                uId = Long.parseLong(currentUserId);
            } catch (NumberFormatException e) {
                // Ignore invalid currentUserId
            }
        }

        if (uId != null && !posts.isEmpty()) {
            java.util.Set<Long> likedPostIds = new java.util.HashSet<>(likeRepository.findPostIdsByUserId(uId));
            for (Post post : posts) {
                post.setLikedByUser(likedPostIds.contains(post.getId()));
            }
        }
        return posts;
    }
    
    public Optional<Post> getPostById(Long postId) {
        return getPostById(postId, null);
    }
    
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public Optional<Post> getPostById(Long postId, String currentUserId) {
        Optional<Post> postOpt = postRepository.findById(postId);
        if (postOpt.isPresent() && currentUserId != null) {
            Post post = postOpt.get();
            Long uId = Long.parseLong(currentUserId);
            post.setLikedByUser(likeRepository.findByUserIdAndPostId(uId, post.getId()) != null);
        }
        return postOpt;
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
