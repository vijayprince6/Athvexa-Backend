package com.athvexa.service;

public class PointsCalculator {
    
    public static Integer calculatePoints(String achievementLevel, Integer position) {
        if (achievementLevel == null || position == null) {
            return 0;
        }
        
        int basePoints = getBasePoints(achievementLevel);
        
        return switch (position) {
            case 1 -> basePoints; // 1st place
            case 2 -> (int) (basePoints * 0.67); // 2nd place
            case 3 -> (int) (basePoints * 0.42); // 3rd place
            default -> (int) (basePoints * 0.17); // Participation
        };
    }
    
    private static int getBasePoints(String achievementLevel) {
        if (achievementLevel == null) return 0;
        return switch (achievementLevel.toUpperCase()) {
            case "LOCAL LEVEL (SCHOOL / VILLAGE / CLUB)", "LOCAL_LEVEL" -> 30;
            case "DISTRICT LEVEL", "DISTRICT_LEVEL" -> 60;
            case "STATE LEVEL", "STATE_LEVEL" -> 120;
            case "NATIONAL LEVEL", "NATIONAL_LEVEL" -> 300;
            case "INTERNATIONAL LEVEL", "INTERNATIONAL_LEVEL" -> 500;
            case "OLYMPICS LEVEL", "OLYMPICS_LEVEL" -> 1000;
            default -> 0;
        };
    }
}
