package com.athvexa.repository;

import com.athvexa.model.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    
    @Query("SELECT l FROM Like l WHERE l.userId = :userId")
    List<Like> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT l FROM Like l WHERE l.postId = :postId")
    List<Like> findByPostId(@Param("postId") Long postId);
    
    @Query("SELECT COUNT(l) FROM Like l WHERE l.postId = :postId")
    long countByPostId(@Param("postId") Long postId);
    
    @Query("SELECT l.postId FROM Like l WHERE l.userId = :userId")
    List<Long> findPostIdsByUserId(@Param("userId") Long userId);

    @Query("SELECT l FROM Like l WHERE l.userId = :userId AND l.postId = :postId")
    Like findByUserIdAndPostId(@Param("userId") Long userId, @Param("postId") Long postId);
    
    void deleteByUserIdAndPostId(@Param("userId") Long userId, @Param("postId") Long postId);
}
