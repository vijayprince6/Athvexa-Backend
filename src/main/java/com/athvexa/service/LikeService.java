package com.athvexa.service;

import com.athvexa.model.Like;
import com.athvexa.model.Post;
import com.athvexa.repository.LikeRepository;
import com.athvexa.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LikeService {
    
    @Autowired
    private LikeRepository likeRepository;
    
    @Autowired
    private PostRepository postRepository;
    
    public Like likePost(String userId, Long postId) {
        Long uId = Long.parseLong(userId);
        // Check if user already liked this post - Toggle logic
        Like existingLike = likeRepository.findByUserIdAndPostId(uId, postId);
        if (existingLike != null) {
            likeRepository.delete(existingLike);
            // Update likesCount on Post
            Post post = postRepository.findById(postId).orElse(null);
            if (post != null) {
                post.setLikesCount(Math.max(0, (post.getLikesCount() != null ? post.getLikesCount() : 1) - 1));
                postRepository.save(post);
            }
            return existingLike;
        }
        
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        // Update likesCount on Post
        post.setLikesCount((post.getLikesCount() != null ? post.getLikesCount() : 0) + 1);
        postRepository.save(post);
        
        Like like = new Like();
        like.setUserId(uId);
        like.setPostId(postId);
        like.setPost(post);
        
        return likeRepository.save(like);
    }
    
    public void unlikePost(String userId, Long postId) {
        Like like = likeRepository.findByUserIdAndPostId(Long.parseLong(userId), postId);
        if (like == null) {
            throw new RuntimeException("You have not liked this post");
        }
        
        likeRepository.delete(like);
    }
    
    public List<Like> getUserLikes(String userId) {
        return likeRepository.findByUserId(Long.parseLong(userId));
    }
    
    public List<Like> getPostLikes(Long postId) {
        return likeRepository.findByPostId(postId);
    }
    
    public boolean isPostLikedByUser(String userId, Long postId) {
        return likeRepository.findByUserIdAndPostId(Long.parseLong(userId), postId) != null;
    }
}
