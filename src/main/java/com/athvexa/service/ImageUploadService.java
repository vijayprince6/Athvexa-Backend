package com.athvexa.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class ImageUploadService {
    
    @Autowired
    private Cloudinary cloudinary;
    
    @Value("${cloudinary.cloud_name}")
    private String cloudName;
    
    @Value("${cloudinary.api_key}")
    private String apiKey;
    
    @Value("${cloudinary.api_secret}")
    private String apiSecret;
    
    public Map<String, Object> uploadImage(MultipartFile file) throws IOException {
        // Validate file size (max 2MB)
        if (file.getSize() > 2 * 1024 * 1024) {
            throw new RuntimeException("File size exceeds 2MB limit");
        }
        
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Only image files are allowed");
        }
        
        Map<String, Object> uploadOptions = new HashMap<>();
        uploadOptions.put("resource_type", "auto");
        uploadOptions.put("folder", "athvexa_posts");
        
        // Upload to Cloudinary
        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadOptions);
        
        String imageUrl = (String) uploadResult.get("secure_url");
        String publicId = (String) uploadResult.get("public_id");
        
        Map<String, Object> result = new HashMap<>();
        result.put("image_url", imageUrl);
        result.put("public_id", publicId);
        
        return result;
    }
    
    public void deleteImage(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete image: " + e.getMessage());
        }
    }
}
