package com.athvexa.service;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class AchievementValidationService {

    // Sports options matching frontend
    private static final List<String> SPORTS = Arrays.asList(
        "archery", "athletics", "badminton", "baseball", "basketball", "boxing",
        "carrom", "chess", "cricket", "cycling", "fencing", "football", "golf",
        "gymnastics", "handball", "hockey", "icehockey", "judo", "kabaddi",
        "karate", "rugby", "skating", "snooker", "surfing", "swimming",
        "tabletennis", "tennis", "volleyball", "weightlifting", "wrestling",
        "horseriding", "shooting", "sailing", "squash", "taekwondo"
    );

    // Achievement levels
    private static final List<String> ACHIEVEMENT_LEVELS = Arrays.asList(
        "local level", "district level", "state level", "national level",
        "international level", "olympics level", "school level", "college level",
        "university level", "club level"
    );

    // Position options
    private static final List<String> POSITIONS = Arrays.asList(
        "1st", "2nd", "3rd", "participation", "first", "second", "third", "participate"
    );

    public ValidationResult validateAchievement(String extractedText, String selectedSport, 
                                               String selectedLevel, String selectedPosition) {
        
        String normalizedText = extractedText.toLowerCase();
        
        // Validate sport
        boolean sportMatch = validateSport(normalizedText, selectedSport);
        
        // Validate achievement level
        boolean levelMatch = validateAchievementLevel(normalizedText, selectedLevel);
        
        // Validate position
        boolean positionMatch = validatePosition(normalizedText, selectedPosition);
        
        if (sportMatch && levelMatch && positionMatch) {
            return new ValidationResult(true, "🎉 Achievement verified and posted successfully", null);
        } else {
            String reason = buildFailureReason(sportMatch, levelMatch, positionMatch);
            return new ValidationResult(false, 
                "🚫 Oops! Your achievement could not be verified. Please upload a valid certificate matching your selected sport, level, and position.",
                reason);
        }
    }

    private boolean validateSport(String normalizedText, String selectedSport) {
        if (selectedSport == null || selectedSport.isEmpty()) return false;
        
        String normalizedSport = selectedSport.toLowerCase();
        
        // Direct match
        if (normalizedText.contains(normalizedSport)) {
            return true;
        }
        
        // Fuzzy match - check if any sport keyword exists in text
        for (String sport : SPORTS) {
            if (normalizedText.contains(sport.toLowerCase())) {
                return sport.equalsIgnoreCase(normalizedSport);
            }
        }
        
        return false;
    }

    private boolean validateAchievementLevel(String normalizedText, String selectedLevel) {
        if (selectedLevel == null || selectedLevel.isEmpty()) return false;
        
        String normalizedLevel = selectedLevel.toLowerCase();
        
        // Direct match
        if (normalizedText.contains(normalizedLevel)) {
            return true;
        }
        
        // Check for level keywords
        for (String level : ACHIEVEMENT_LEVELS) {
            if (normalizedText.contains(level.toLowerCase())) {
                // Map variations to standard values
                if (level.contains("local") && normalizedLevel.contains("local")) return true;
                if (level.contains("district") && normalizedLevel.contains("district")) return true;
                if (level.contains("state") && normalizedLevel.contains("state")) return true;
                if (level.contains("national") && normalizedLevel.contains("national")) return true;
                if (level.contains("international") && normalizedLevel.contains("international")) return true;
                if (level.contains("olympics") && normalizedLevel.contains("olympics")) return true;
                if (level.contains("school") && normalizedLevel.contains("school")) return true;
                if (level.contains("college") && normalizedLevel.contains("college")) return true;
                if (level.contains("university") && normalizedLevel.contains("university")) return true;
                if (level.contains("club") && normalizedLevel.contains("club")) return true;
            }
        }
        
        return false;
    }

    private boolean validatePosition(String normalizedText, String selectedPosition) {
        if (selectedPosition == null || selectedPosition.isEmpty()) return false;
        
        String normalizedPosition = selectedPosition.toLowerCase();
        
        // Direct match
        if (normalizedText.contains(normalizedPosition)) {
            return true;
        }
        
        // Check for position keywords with variations
        if (normalizedPosition.equals("1") || normalizedPosition.equals("first")) {
            return normalizedText.contains("1st") || normalizedText.contains("first") || 
                   normalizedText.contains("1 position") || normalizedText.contains("winner");
        }
        
        if (normalizedPosition.equals("2") || normalizedPosition.equals("second")) {
            return normalizedText.contains("2nd") || normalizedText.contains("second") || 
                   normalizedText.contains("2 position") || normalizedText.contains("runner up");
        }
        
        if (normalizedPosition.equals("3") || normalizedPosition.equals("third")) {
            return normalizedText.contains("3rd") || normalizedText.contains("third") || 
                   normalizedText.contains("3 position");
        }
        
        if (normalizedPosition.equals("participate") || normalizedPosition.equals("participation")) {
            return normalizedText.contains("participat") || normalizedText.contains("certificate") ||
                   normalizedText.contains("completion");
        }
        
        return false;
    }

    private String buildFailureReason(boolean sportMatch, boolean levelMatch, boolean positionMatch) {
        StringBuilder reason = new StringBuilder("❌ Verification Failed\nReason:\n");
        
        if (!sportMatch) {
            reason.append("- Sport not found OR mismatched\n");
        }
        if (!levelMatch) {
            reason.append("- Achievement level incorrect\n");
        }
        if (!positionMatch) {
            reason.append("- Position incorrect\n");
        }
        
        return reason.toString();
    }

    public static class ValidationResult {
        private boolean valid;
        private String message;
        private String reason;

        public ValidationResult(boolean valid, String message, String reason) {
            this.valid = valid;
            this.message = message;
            this.reason = reason;
        }

        public boolean isValid() {
            return valid;
        }

        public String getMessage() {
            return message;
        }

        public String getReason() {
            return reason;
        }
    }
}
