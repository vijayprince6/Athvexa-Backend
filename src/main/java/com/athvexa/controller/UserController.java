package com.athvexa.controller;

import com.athvexa.model.User;
import com.athvexa.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam("query") String query) {
        List<User> users = userService.searchUsers(query);
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/with-points")
    public ResponseEntity<List<User>> getUsersWithPoints() {
        List<User> users = userService.getUsersWithPoints();
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/occupation/{occupation}")
    public ResponseEntity<List<User>> getUsersByOccupation(@PathVariable String occupation) {
        List<User> users = userService.getUsersByOccupation(occupation.toUpperCase());
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/occupation/{occupation}/gender/{gender}")
    public ResponseEntity<List<User>> getUsersByOccupationAndGender(
            @PathVariable String occupation,
            @PathVariable String gender) {
        List<User> users = userService.getUsersByOccupationAndGender(
            occupation.toUpperCase(),
            gender.toUpperCase()
        );
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable String userId) {
        try {
            User user = userService.findById(Long.parseLong(userId)).orElse(null);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(
            @PathVariable String userId,
            @RequestBody User userDetails) {
        try {
            User updatedUser = userService.updateUser(userId, userDetails);
            return ResponseEntity.ok(Map.of(
                "message", "User updated successfully",
                "user", updatedUser
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
