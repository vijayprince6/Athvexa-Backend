package com.athvexa.controller;

import com.athvexa.model.Like;
import com.athvexa.service.LikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/likes")
public class LikeController {
    
    @Autowired
    private LikeService likeService;
    
    @PostMapping("/like")
    public ResponseEntity<?> likePost(
            @RequestParam("userId") String userId,
            @RequestParam("postId") Long postId) {
        try {
            Like like = likeService.likePost(userId, postId);
            return ResponseEntity.ok(Map.of(
                "message", "Post liked successfully",
                "likeId", like.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/unlike")
    public ResponseEntity<?> unlikePost(
            @RequestParam("userId") String userId,
            @RequestParam("postId") Long postId) {
        try {
            likeService.unlikePost(userId, postId);
            return ResponseEntity.ok(Map.of("message", "Post unliked successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Like>> getUserLikes(@PathVariable String userId) {
        List<Like> likes = likeService.getUserLikes(userId);
        return ResponseEntity.ok(likes);
    }
    
    @GetMapping("/post/{postId}")
    public ResponseEntity<List<Like>> getPostLikes(@PathVariable Long postId) {
        List<Like> likes = likeService.getPostLikes(postId);
        return ResponseEntity.ok(likes);
    }
    
    @GetMapping("/post/{postId}/users")
    public ResponseEntity<?> getPostLikers(@PathVariable Long postId) {
        try {
            List<com.athvexa.model.User> likers = likeService.getPostLikers(postId);
            return ResponseEntity.ok(likers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/check")
    public ResponseEntity<?> checkLike(
            @RequestParam("userId") String userId,
            @RequestParam("postId") Long postId) {
        boolean isLiked = likeService.isPostLikedByUser(userId, postId);
        return ResponseEntity.ok(Map.of("isLiked", isLiked));
    }
}
