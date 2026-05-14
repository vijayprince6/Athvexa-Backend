package com.athvexa.repository;

import com.athvexa.model.Message;
import com.athvexa.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    @Query("SELECT m FROM Message m WHERE (m.sender.id = :userId OR m.receiver.id = :userId) ORDER BY m.createdAt DESC")
    List<Message> findAllMessagesByUserId(@Param("userId") String userId);
    
    @Query("SELECT m FROM Message m WHERE (m.sender.id = :userId AND m.receiver.id = :otherUserId) OR (m.sender.id = :otherUserId AND m.receiver.id = :userId) ORDER BY m.createdAt ASC")
    List<Message> findConversationBetweenUsers(@Param("userId") String userId, @Param("otherUserId") String otherUserId);
    
    @Query("SELECT m FROM Message m WHERE m.receiver.id = :userId AND m.isRead = false ORDER BY m.createdAt DESC")
    List<Message> findUnreadMessagesByUserId(@Param("userId") String userId);
    
    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver.id = :userId AND m.isRead = false")
    Integer countUnreadMessagesByUserId(@Param("userId") String userId);
    
    @Query("SELECT DISTINCT m.sender FROM Message m WHERE m.receiver.id = :userId")
    List<User> findDistinctSendersByReceiverId(@Param("userId") String userId);
    
    @Query("SELECT DISTINCT m.receiver FROM Message m WHERE m.sender.id = :userId")
    List<User> findDistinctReceiversBySenderId(@Param("userId") String userId);
}
