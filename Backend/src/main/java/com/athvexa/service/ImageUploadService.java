package com.athvexa.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class ImageUploadService {
    
    @Autowired
    private Cloudinary cloudinary;
    
    public Map<String, Object> uploadImage(MultipartFile file) throws IOException {
        // Validate file size (max 10MB)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new RuntimeException("File size exceeds 10MB limit");
        }
        
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/") && !contentType.startsWith("video/"))) {
            throw new RuntimeException("Only image and video files are allowed");
        }
        
        System.out.println("Uploading image to Cloudinary: " + file.getOriginalFilename() + " (" + file.getSize() + " bytes)");
        
        Map<String, Object> uploadOptions = new HashMap<>();
        uploadOptions.put("resource_type", "auto");
        uploadOptions.put("folder", "athvexa_posts");
        
        try {
            // Upload to Cloudinary
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadOptions);
            
            String imageUrl = (String) uploadResult.get("secure_url");
            String publicId = (String) uploadResult.get("public_id");
            
            System.out.println("Upload successful: " + imageUrl);
            
            Map<String, Object> result = new HashMap<>();
            result.put("image_url", imageUrl);
            result.put("public_id", publicId);
            
            return result;
        } catch (Exception e) {
            System.err.println("Cloudinary upload failed: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Cloudinary upload failed: " + e.getMessage());
        }
    }
    
    public void deleteImage(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete image: " + e.getMessage());
        }
    }
}
