package com.athvexa.controller;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    @Autowired
    private Cloudinary cloudinary;

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
}
