package com.athvexa.controller;

import com.athvexa.repository.UserRepository;
import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    @Autowired
    private Cloudinary cloudinary;

    @Autowired
    private UserRepository userRepository;

    // Task 1 helper: GET /api/debug/coaches — lists every user with their role & sport
    @GetMapping("/coaches")
    public ResponseEntity<?> listAllCoaches() {
        List<Map<String, Object>> result = userRepository.findAll().stream()
            .map(u -> Map.<String, Object>of(
                "id",       u.getId(),
                "username", u.getUsername() != null ? u.getUsername() : "",
                "name",     u.getName()     != null ? u.getName()     : "",
                "role",     u.getRole()     != null ? u.getRole()     : "null",
                "sport",    u.getSport()    != null ? u.getSport()    : "null"
            ))
            .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/cloudinary-check")
    public ResponseEntity<?> checkCloudinary() {
        try {
            String cloudName = cloudinary.config.cloudName;
            String apiKey = cloudinary.config.apiKey;
            boolean hasSecret = cloudinary.config.apiSecret != null && !cloudinary.config.apiSecret.isEmpty();
            
            return ResponseEntity.ok(Map.of(
                "status", "Configured",
                "cloudName", cloudName,
                "apiKey", apiKey,
                "hasSecret", hasSecret,
                "message", "Cloudinary bean is correctly initialized"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "status", "Error",
                "error", e.getMessage()
            ));
        }
    }

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @GetMapping("/db-posts-schema")
    public ResponseEntity<?> checkPostsSchema() {
        try {
            List<Map<String, Object>> columns = jdbcTemplate.queryForList(
                "SELECT column_name, data_type, is_nullable, column_default " +
                "FROM information_schema.columns " +
                "WHERE table_name = 'posts'"
            );
            return ResponseEntity.ok(columns);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
