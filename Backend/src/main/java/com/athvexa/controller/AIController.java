package com.athvexa.controller;

import com.athvexa.dto.AIProfileRequest;
import com.athvexa.dto.AIProfileResponse;
import com.athvexa.service.AIService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AIController — exposes the @username GenAI profile-summary feature.
 *
 * Endpoint:
 *   POST /api/ai/profile-summary
 *
 * Request body examples:
 *   { "username": "vijayprince" }
 *   { "username": "vijayprince", "question": "what sport does he play?" }
 *   { "username": "coachname",   "question": "summarize this coach" }
 *
 * Security:
 *   - Covered by the existing permitAll() on /api/** in SecurityConfig.
 *   - The Gemini API key never appears in any response.
 *   - No sensitive user data (email, password, authId, DOB) is returned.
 */
@RestController
@RequestMapping("/api/ai")
public class AIController {

    private static final Logger log = LoggerFactory.getLogger(AIController.class);

    @Autowired
    private AIService aiService;

    /**
     * Generate an AI profile summary for a given @username.
     *
     * @param request body containing "username" (required) and optional "question"
     * @return 200 with AIProfileResponse (may include an "error" field on partial failure)
     *         400 if request is invalid (missing username)
     */
    @PostMapping("/profile-summary")
    public ResponseEntity<AIProfileResponse> getProfileSummary(
            @RequestBody AIProfileRequest request) {

        // Validate input
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(AIProfileResponse.builder()
                            .error("Username is required.")
                            .build());
        }

        // Strip leading @ if the frontend sends it that way (defensive)
        String username = request.getUsername().trim();
        if (username.startsWith("@")) {
            username = username.substring(1);
        }

        String question = (request.getQuestion() != null && !request.getQuestion().isBlank())
                ? request.getQuestion().trim()
                : null;

        log.info("AI profile summary requested for username='{}', question='{}'",
                username, question != null ? question : "(none)");

        AIProfileResponse response = aiService.generateProfileSummary(username, question);

        // Always return 200 — errors are carried in the response body's `error` field
        // so the frontend can display them gracefully
        return ResponseEntity.ok(response);
    }
}
