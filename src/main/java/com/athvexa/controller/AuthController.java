package com.athvexa.controller;

import com.athvexa.model.User;
import com.athvexa.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.HashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private UserService userService;
    

    
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            User newUser = userService.createUser(user);
            
            // Return full user data for immediate auto-login
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Account created successfully!");
            response.put("userId", newUser.getId().toString());
            response.put("email", newUser.getEmail());
            response.put("name", newUser.getName() != null ? newUser.getName() : "");
            response.put("username", newUser.getUsername() != null ? newUser.getUsername() : "");
            response.put("fullName", newUser.getFullName() != null ? newUser.getFullName() : "");
            response.put("dateOfBirth", newUser.getDateOfBirth() != null ? newUser.getDateOfBirth() : "");
            response.put("gender", newUser.getGender() != null ? newUser.getGender() : "");
            response.put("occupation", newUser.getOccupation() != null ? newUser.getOccupation() : "");
            response.put("occupationName", newUser.getOccupationName() != null ? newUser.getOccupationName() : "");
            response.put("bio", newUser.getBio() != null ? newUser.getBio() : "");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            String msg = e.getMessage();
            if (msg != null && msg.contains("Email already exists")) {
                return ResponseEntity.status(409).body(Map.of(
                    "error", "An account with this email already exists. Please login instead.",
                    "errorCode", "EMAIL_EXISTS"
                ));
            }
            return ResponseEntity.badRequest().body(Map.of("error", msg));
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");
            
            System.out.println("=== FRONTEND LOGIN ATTEMPT ===");
            System.out.println("Email: " + email);
            System.out.println("Credentials: " + credentials);
            
            // Find user by email
            User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            System.out.println("User found: " + user.getEmail());
            
            // Verify password using UserService for consistency
            boolean matches = userService.verifyPassword(password, user.getPassword());
            System.out.println("Password matches: " + matches);
            
            if (!matches) {
                throw new RuntimeException("Invalid password");
            }
            
            // Handle null values safely
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("userId", user.getId().toString());
            response.put("email", user.getEmail());
            response.put("name", user.getName() != null ? user.getName() : "");
            response.put("username", user.getUsername() != null ? user.getUsername() : "");
            response.put("fullName", user.getFullName() != null ? user.getFullName() : "");
            response.put("dateOfBirth", user.getDateOfBirth() != null ? user.getDateOfBirth() : "");
            response.put("gender", user.getGender() != null ? user.getGender() : "");
            response.put("occupation", user.getOccupation() != null ? user.getOccupation() : "");
            response.put("occupationName", user.getOccupationName() != null ? user.getOccupationName() : "");
            response.put("bio", user.getBio() != null ? user.getBio() : "");
            
            System.out.println("=== LOGIN SUCCESS ===");
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            System.out.println("Login error: " + e.getMessage());
            if ("User not found".equals(e.getMessage())) {
                return ResponseEntity.status(404).body(Map.of(
                    "error", "No account found.",
                    "errorCode", "USER_NOT_FOUND"
                ));
            } else if ("Invalid password".equals(e.getMessage())) {
                return ResponseEntity.status(401).body(Map.of(
                    "error", "Incorrect email or password.",
                    "errorCode", "WRONG_PASSWORD"
                ));
            }
            return ResponseEntity.badRequest().body(Map.of("error", "Login failed. Please try again."));
        }
    }
    
    @GetMapping("/current-user")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            User user = (User) authentication.getPrincipal();
            return ResponseEntity.ok(Map.of(
                "userId", user.getId().toString(),
                "email", user.getEmail(),
                "name", user.getName(),
                "username", user.getUsername(),
                "bio", user.getBio()
            ));
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Not authenticated"));
    }
    
    @GetMapping("/check-user/{email}")
    public ResponseEntity<?> checkUser(@PathVariable String email) {
        try {
            User user = userService.findByEmail(email)
                .orElse(null);
            
            if (user != null) {
                return ResponseEntity.ok(Map.of(
                    "exists", true,
                    "userId", user.getId().toString(),
                    "email", user.getEmail(),
                    "username", user.getUsername(),
                    "hasPassword", user.getPassword() != null && !user.getPassword().isEmpty(),
                    "storedPassword", user.getPassword()
                ));
            } else {
                return ResponseEntity.ok(Map.of("exists", false));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/test-password")
    public ResponseEntity<?> testPassword(@RequestParam String email, @RequestParam String password) {
        try {
            User user = userService.findByEmail(email)
                .orElse(null);
            
            if (user != null) {
                boolean matches = userService.verifyPassword(password, user.getPassword());
                return ResponseEntity.ok(Map.of(
                    "email", email,
                    "inputPassword", password,
                    "storedPassword", user.getPassword(),
                    "matches", matches
                ));
            } else {
                return ResponseEntity.ok(Map.of("error", "User not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/debug-login")
    public ResponseEntity<?> debugLogin(@RequestParam String email, @RequestParam String password) {
        try {
            System.out.println("=== DEBUG LOGIN ATTEMPT ===");
            System.out.println("Email: " + email);
            System.out.println("Password: " + password);
            
            User user = userService.findByEmail(email)
                .orElse(null);
            
            if (user != null) {
                System.out.println("User found: " + user.getEmail());
                System.out.println("Stored password: " + user.getPassword());
                
                boolean matches = userService.verifyPassword(password, user.getPassword());
                System.out.println("Password matches: " + matches);
                
                if (matches) {
                    return ResponseEntity.ok(Map.of("message", "Login successful"));
                } else {
                    return ResponseEntity.ok(Map.of("error", "Invalid password"));
                }
            } else {
                return ResponseEntity.ok(Map.of("error", "User not found"));
            }
        } catch (Exception e) {
            System.out.println("Exception: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
