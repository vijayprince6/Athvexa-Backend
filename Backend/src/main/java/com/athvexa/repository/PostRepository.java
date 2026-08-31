package com.athvexa.repository;

import com.athvexa.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    List<Post> findAllByOrderByCreatedAtDesc();
    
    @Query("SELECT p FROM Post p WHERE p.userId = :userId ORDER BY p.createdAt DESC")
    List<Post> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);
    
    List<Post> findBySportOrderByPointsDesc(String sport);

    List<Post> findByUserIdIn(List<Long> userIds);
    
    @Query("SELECT COUNT(l) FROM Like l WHERE l.postId = :postId")
    Integer countLikesByPostId(@Param("postId") Long postId);
}
