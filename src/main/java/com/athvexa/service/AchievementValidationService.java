package com.athvexa.service;

import org.springframework.stereotype.Service;

@Service
public class AchievementValidationService {

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
        
        // Check if selected sport (with or without spaces) exists in text
        String sportWithSpaces = normalizedSport.replaceAll("([a-z])([A-Z])", "$1 $2");
        String sportWithoutSpaces = normalizedSport.replaceAll("\\s+", "");
        
        return normalizedText.contains(sportWithSpaces) || normalizedText.contains(sportWithoutSpaces);
    }

    private boolean validateAchievementLevel(String normalizedText, String selectedLevel) {
        if (selectedLevel == null || selectedLevel.isEmpty()) return false;
        
        String normalizedLevel = selectedLevel.toLowerCase();
        
        // Extract the main keyword from the level (e.g., "district" from "district level")
        String levelKeyword = normalizedLevel.split(" ")[0];
        
        // Check if the level keyword exists in text
        if (normalizedText.contains(levelKeyword)) {
            return true;
        }
        
        // Also check for full level name
        return normalizedText.contains(normalizedLevel);
    }

    private boolean validatePosition(String normalizedText, String selectedPosition) {
        if (selectedPosition == null || selectedPosition.isEmpty()) return false;
        
        String normalizedPosition = selectedPosition.toLowerCase();
        
        // Extract the main keyword from position (e.g., "1st" from "1st place")
        String positionKeyword = normalizedPosition.split(" ")[0];
        
        // Check for common position variations
        if (positionKeyword.equals("1st") || positionKeyword.equals("first")) {
            return normalizedText.contains("1st") || normalizedText.contains("first") || 
                   normalizedText.contains("1 st") || normalizedText.contains("first place");
        } else if (positionKeyword.equals("2nd") || positionKeyword.equals("second")) {
            return normalizedText.contains("2nd") || normalizedText.contains("second") || 
                   normalizedText.contains("2 nd") || normalizedText.contains("second place");
        } else if (positionKeyword.equals("3rd") || positionKeyword.equals("third")) {
            return normalizedText.contains("3rd") || normalizedText.contains("third") || 
                   normalizedText.contains("3 rd") || normalizedText.contains("third place");
        } else if (positionKeyword.equals("participation") || positionKeyword.equals("participate")) {
            return normalizedText.contains("participation") || normalizedText.contains("participate");
        }
        
        // Check if the position keyword exists in text
        if (normalizedText.contains(positionKeyword)) {
            return true;
        }
        
        // Also check for full position name
        return normalizedText.contains(normalizedPosition);
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
