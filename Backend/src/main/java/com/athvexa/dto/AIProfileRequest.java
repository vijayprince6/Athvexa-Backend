package com.athvexa.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Request body for POST /api/ai/profile-summary
 * 
 * Examples:
 *   { "username": "vijayprince" }
 *   { "username": "vijayprince", "question": "what sport does he play?" }
 *   { "username": "coachname", "question": "summarize this coach" }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIProfileRequest {

    /** The @username to look up (without the @ symbol). Required. */
    private String username;

    /**
     * Optional natural-language question about the profile.
     * If null or blank, the AI generates a general profile summary.
     */
    private String question;
}
