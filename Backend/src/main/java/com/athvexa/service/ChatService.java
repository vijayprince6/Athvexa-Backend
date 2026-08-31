package com.athvexa.service;

import com.athvexa.model.Message;
import com.athvexa.model.User;
import com.athvexa.repository.MessageRepository;
import com.athvexa.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {
    
    @Autowired
    private MessageRepository messageRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public Message sendMessage(String senderId, String receiverUsername, String content) {
        User sender = userRepository.findById(Long.parseLong(senderId))
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        
        User receiver = userRepository.findByUsername(receiverUsername)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));
        
        if (sender.getId().equals(receiver.getId())) {
            throw new RuntimeException("Cannot send message to yourself");
        }
        
        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setSenderId(sender.getId());
        message.setReceiverId(receiver.getId());
        message.setContent(content);
        message.setIsRead(false);
        
        if (sender.getAuthId() != null) message.setSenderUuid(sender.getAuthId());
        if (receiver.getAuthId() != null) message.setReceiverUuid(receiver.getAuthId());
        
        return messageRepository.save(message);
    }
    
    public List<Message> getConversation(String userId, String otherUserId) {
        userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        userRepository.findById(Long.parseLong(otherUserId))
                .orElseThrow(() -> new RuntimeException("Other user not found"));
        
        List<Message> messages = messageRepository.findConversationBetweenUsers(userId, otherUserId);
        
        // Mark messages as read
        markMessagesAsRead(userId, otherUserId);
        
        return messages;
    }
    
    public List<Message> getUnreadMessages(String userId) {
        return messageRepository.findUnreadMessagesByUserId(userId);
    }
    
    public List<User> getChatUsers(String userId) {
        userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<User> senders = messageRepository.findDistinctSendersByReceiverId(userId);
        List<User> receivers = messageRepository.findDistinctReceiversBySenderId(userId);
        
        // Combine and remove duplicates
        senders.addAll(receivers);
        return senders.stream()
                .distinct()
                .collect(java.util.stream.Collectors.toList());
    }
    
    public Integer getUnreadMessagesCount(String userId) {
        return messageRepository.countUnreadMessagesByUserId(userId);
    }
    
    public void markMessagesAsRead(String userId, String senderId) {
        List<Message> unreadMessages = messageRepository.findUnreadMessagesByUserId(userId);
        
        unreadMessages.stream()
                .filter(message -> message.getSenderId().toString().equals(senderId))
                .forEach(message -> {
                    message.setIsRead(true);
                    messageRepository.save(message);
                });
    }
    
    public void deleteMessage(Long messageId, String userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        
        // Only allow sender or receiver to delete the message
        if (!message.getSenderId().toString().equals(userId) && 
            !message.getReceiverId().toString().equals(userId)) {
            throw new RuntimeException("You can only delete your own messages");
        }
        
        messageRepository.delete(message);
    }
    
    public List<Message> getAllUserMessages(String userId) {
        return messageRepository.findAllMessagesByUserId(userId);
    }
}
