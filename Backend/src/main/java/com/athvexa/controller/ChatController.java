package com.athvexa.controller;

import com.athvexa.model.Message;
import com.athvexa.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    
    @Autowired
    private ChatService chatService;
    
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(
            @RequestParam("senderId") String senderId,
            @RequestParam("receiverUsername") String receiverUsername,
            @RequestParam("content") String content) {
        try {
            Message message = chatService.sendMessage(senderId, receiverUsername, content);
            return ResponseEntity.ok(Map.of(
                "message", "Message sent successfully",
                "messageId", message.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/conversation")
    public ResponseEntity<List<Message>> getConversation(
            @RequestParam("userId") String userId,
            @RequestParam("otherUserId") String otherUserId) {
        List<Message> messages = chatService.getConversation(userId, otherUserId);
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/unread")
    public ResponseEntity<List<Message>> getUnreadMessages(@RequestParam("userId") String userId) {
        List<Message> messages = chatService.getUnreadMessages(userId);
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/users")
    public ResponseEntity<?> getChatUsers(@RequestParam("userId") String userId) {
        try {
            var chatUsers = chatService.getChatUsers(userId);
            return ResponseEntity.ok(chatUsers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/unread/count")
    public ResponseEntity<Integer> getUnreadMessagesCount(@RequestParam("userId") String userId) {
        Integer count = chatService.getUnreadMessagesCount(userId);
        return ResponseEntity.ok(count);
    }
    
    @PostMapping("/read")
    public ResponseEntity<?> markMessagesAsRead(
            @RequestParam("userId") String userId,
            @RequestParam("senderId") String senderId) {
        try {
            chatService.markMessagesAsRead(userId, senderId);
            return ResponseEntity.ok(Map.of("message", "Messages marked as read"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/delete/{messageId}")
    public ResponseEntity<?> deleteMessage(
            @PathVariable Long messageId,
            @RequestParam("userId") String userId) {
        try {
            chatService.deleteMessage(messageId, userId);
            return ResponseEntity.ok(Map.of("message", "Message deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/all/{userId}")
    public ResponseEntity<List<Message>> getAllUserMessages(@PathVariable String userId) {
        List<Message> messages = chatService.getAllUserMessages(userId);
        return ResponseEntity.ok(messages);
    }
}
