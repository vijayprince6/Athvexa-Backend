package com.athvexa.service;

import com.athvexa.model.Like;
import com.athvexa.model.Post;
import com.athvexa.repository.LikeRepository;
import com.athvexa.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class LikeService {
    
    @Autowired
    private LikeRepository likeRepository;
    
    @Autowired
    private PostRepository postRepository;

    @Autowired
    private com.athvexa.repository.UserRepository userRepository;
    
    @Transactional
    public Like likePost(String userId, Long postId) {
        Long uId = Long.parseLong(userId);
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        com.athvexa.model.User user = userRepository.findById(uId)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        // Check if user already liked this post - Toggle logic
        Like existingLike = likeRepository.findByUserIdAndPostId(uId, postId);
        
        if (existingLike != null) {
            likeRepository.delete(existingLike);
            // Flush to ensure count is accurate
            likeRepository.flush();
        } else {
            Like like = new Like();
            like.setUserId(uId);
            like.setUserUuid(user.getAuthId());
            like.setPostId(postId);
            like.setPost(post);
            likeRepository.save(like);
            // Flush to ensure count is accurate
            likeRepository.flush();
        }
        
        // Update likesCount on Post based on actual record count
        int actualLikeCount = (int) likeRepository.countByPostId(postId);
        post.setLikesCount(actualLikeCount);
        postRepository.save(post);
        
        return existingLike != null ? existingLike : likeRepository.findByUserIdAndPostId(uId, postId);
    }
    
    @Transactional
    public void unlikePost(String userId, Long postId) {
        Long uId = Long.parseLong(userId);
        Like like = likeRepository.findByUserIdAndPostId(uId, postId);
        if (like == null) {
            throw new RuntimeException("You have not liked this post");
        }
        
        likeRepository.delete(like);
        likeRepository.flush();
        
        // Update likesCount on Post
        Post post = postRepository.findById(postId).orElse(null);
        if (post != null) {
            int actualLikeCount = (int) likeRepository.countByPostId(postId);
            post.setLikesCount(actualLikeCount);
            postRepository.save(post);
        }
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
