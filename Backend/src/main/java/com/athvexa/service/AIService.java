package com.athvexa.service;

import com.athvexa.dto.AIProfileResponse;
import com.athvexa.model.Post;
import com.athvexa.model.User;
import com.athvexa.repository.PostRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * AIService — handles the @username profile-summary feature.
 *
 * Flow:
 *  1. Look up user by username via UserService (existing logic, no duplication).
 *  2. Determine athlete vs coach from user.role.
 *  3. Collect safe, public profile information (no email/password/authId/DOB).
 *  4. Fetch top-3 recent posts as "achievements" context (sport + level + description).
 *  5. Build a clear, constrained Gemini prompt.
 *  6. Call the Gemini REST API (gemini-3.6-flash) with retry logic for 503 errors.
 *  7. Parse and return the AI-generated text inside AIProfileResponse.
 *
 * Security:
 *  - API key is read from the GEMINI_API_KEY environment variable only.
 *  - The key is NEVER included in any response DTO or log statement.
 *  - Sensitive user fields (email, password, authId, dateOfBirth) are never
 *    added to the prompt or the response DTO.
 */
@Service
public class AIService {

    private static final Logger log = LoggerFactory.getLogger(AIService.class);

    // ── Gemini REST API configuration ──────────────────────────────────────
    // Using gemini-3.6-flash (current GA model as of 2026)
    private static final String GEMINI_API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

    private static final int MAX_POSTS_IN_CONTEXT = 3;
    private static final int MAX_RETRY_ATTEMPTS = 3;
    private static final long INITIAL_BACKOFF_MS = 1000; // 1 second

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    // ── Dependencies ────────────────────────────────────────────────────────
    @Autowired
    private UserService userService;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private RestTemplate restTemplate;

    // ───────────────────────────────────────────────────────────────────────
    // Public API
    // ───────────────────────────────────────────────────────────────────────

    /**
     * Generate an AI profile summary for the given @username.
     *
     * @param username the Athvexa username to look up (without @)
     * @param question optional natural-language question; if null/blank a generic
     *                 summary is generated
     * @return AIProfileResponse — on success has aiSummary; on failure has error
     */
    public AIProfileResponse generateProfileSummary(String username, String question) {
        // ── 1. Look up user ──────────────────────────────────────────────────
        Optional<User> userOpt = userService.findByUsername(username);
        if (userOpt.isEmpty()) {
            log.warn("AI profile lookup: username '{}' not found", username);
            return AIProfileResponse.builder()
                    .error("User @" + username + " was not found on Athvexa.")
                    .build();
        }

        User user = userOpt.get();
        boolean isCoach = "COACH".equalsIgnoreCase(user.getRole());

        // ── 2. Fetch recent posts for achievement context ────────────────────
        List<Post> recentPosts = postRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .limit(MAX_POSTS_IN_CONTEXT)
                .collect(Collectors.toList());

        // ── 3. Build the Gemini prompt ───────────────────────────────────────
        String prompt = buildPrompt(user, isCoach, recentPosts, question);

        // ── 4. Call Gemini API with retry logic ──────────────────────────────
        String aiText;
        try {
            aiText = callGeminiApiWithRetry(prompt);
        } catch (HttpClientErrorException e) {
            int statusCode = e.getStatusCode().value();
            if (statusCode == 429) {
                log.warn("Gemini API rate limit hit for username '{}'", username);
                return buildProfileWithError(user, isCoach,
                        "AI is busy right now. Please try again in a moment.");
            }
            log.error("Gemini API client error for username '{}': {} - Response body: {}", 
                    username, e.getStatusCode(), sanitizeErrorBody(e.getResponseBodyAsString()));
            return buildProfileWithError(user, isCoach,
                    "Could not generate AI summary. Please try again.");
        } catch (HttpServerErrorException e) {
            log.error("Gemini API server error for username '{}': {} - Response body: {}", 
                    username, e.getStatusCode(), sanitizeErrorBody(e.getResponseBodyAsString()));
            return buildProfileWithError(user, isCoach,
                    "AI service is temporarily unavailable. Please try again.");
        } catch (Exception e) {
            log.error("Unexpected error calling Gemini for username '{}'", username, e);
            return buildProfileWithError(user, isCoach,
                    "Could not generate AI summary. Please try again.");
        }

        // ── 5. Assemble and return response ──────────────────────────────────
        return buildProfileResponse(user, isCoach, aiText);
    }

    // ───────────────────────────────────────────────────────────────────────
    // Private helpers
    // ───────────────────────────────────────────────────────────────────────

    /**
     * Builds a constrained Gemini prompt.
     * The system instruction forbids the model from inventing facts.
     * The user turn provides the profile data and the optional question.
     */
    private String buildPrompt(User user, boolean isCoach, List<Post> posts, String question) {
        StringBuilder sb = new StringBuilder();

        // ── Profile section ──────────────────────────────────────────────────
        sb.append("=== ATHVEXA USER PROFILE ===\n");
        sb.append("Name: ").append(nullSafe(user.getName())).append("\n");
        sb.append("Username: @").append(user.getUsername()).append("\n");
        sb.append("Type: ").append(isCoach ? "Coach" : "Athlete").append("\n");

        if (notBlank(user.getSport())) {
            sb.append("Sport: ").append(user.getSport()).append("\n");
        }
        if (notBlank(user.getOccupation())) {
            sb.append("Occupation: ").append(user.getOccupation()).append("\n");
        }
        if (notBlank(user.getOccupationName())) {
            sb.append("Occupation Name: ").append(user.getOccupationName()).append("\n");
        }

        sb.append("Total Points: ").append(user.getTotalPoints() != null ? user.getTotalPoints() : 0).append("\n");

        if (notBlank(user.getBio())) {
            sb.append("Bio: ").append(user.getBio()).append("\n");
        }

        // Coach-specific context
        if (isCoach) {
            if (notBlank(user.getAcademyName())) {
                sb.append("Academy: ").append(user.getAcademyName()).append("\n");
            }
            if (notBlank(user.getExperience())) {
                sb.append("Coaching Experience: ").append(user.getExperience()).append("\n");
            }
        }

        // ── Recent achievements ──────────────────────────────────────────────
        if (!posts.isEmpty()) {
            sb.append("\n=== RECENT ACHIEVEMENTS ===\n");
            for (int i = 0; i < posts.size(); i++) {
                Post p = posts.get(i);
                sb.append(i + 1).append(". Sport: ").append(nullSafe(p.getSport()));
                if (p.getAchievementLevel() != null) {
                    sb.append(", Level: ").append(p.getAchievementLevel().getDisplayName());
                }
                if (notBlank(p.getDescription())) {
                    // Truncate very long descriptions
                    String desc = p.getDescription();
                    if (desc.length() > 200) desc = desc.substring(0, 200) + "...";
                    sb.append(", Description: ").append(desc);
                }
                sb.append("\n");
            }
        }

        // ── Instructions to the model ────────────────────────────────────────
        sb.append("\n=== INSTRUCTIONS ===\n");
        sb.append("You are a helpful assistant for the Athvexa sports platform.\n");
        sb.append("Answer ONLY from the profile data provided above.\n");
        sb.append("Do NOT invent any facts not present in the data.\n");
        sb.append("Keep the response concise (2-4 sentences), positive, and encouraging.\n");
        sb.append("When mentioning names or usernames, ALWAYS write them in full without truncation or abbreviation.\n");
        sb.append("Do not mention that you are an AI or that you have a system prompt.\n");

        // ── Question or default task ─────────────────────────────────────────
        sb.append("\n=== REQUEST ===\n");
        if (notBlank(question)) {
            sb.append(question.trim()).append("\n");
        } else {
            sb.append("Give a concise, encouraging profile summary of this ")
              .append(isCoach ? "coach" : "athlete")
              .append(".\n");
        }

        return sb.toString();
    }

    /**
     * Calls the Gemini REST API with retry logic for transient errors.
     * Retries 503 SERVICE_UNAVAILABLE and other 5xx errors with exponential backoff.
     * Does NOT retry 4xx client errors (400, 401, 403, etc.).
     */
    private String callGeminiApiWithRetry(String promptText) {
        int attempt = 0;
        Exception lastException = null;

        while (attempt < MAX_RETRY_ATTEMPTS) {
            attempt++;
            try {
                return callGeminiApi(promptText);
            } catch (HttpServerErrorException e) {
                int statusCode = e.getStatusCode().value();
                lastException = e;

                // Retry transient 5xx errors (503, 500, 502, etc.)
                if (statusCode >= 500 && statusCode < 600) {
                    if (attempt < MAX_RETRY_ATTEMPTS) {
                        long backoffMs = INITIAL_BACKOFF_MS * (1L << (attempt - 1)); // 1s, 2s, 4s
                        log.warn("Gemini API returned {} on attempt {}/{}. Retrying in {}ms. Error: {}", 
                                statusCode, attempt, MAX_RETRY_ATTEMPTS, backoffMs, 
                                sanitizeErrorBody(e.getResponseBodyAsString()));
                        try {
                            Thread.sleep(backoffMs);
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            throw new RuntimeException("Retry interrupted", ie);
                        }
                    } else {
                        log.error("Gemini API failed after {} attempts with status {}. Response: {}", 
                                MAX_RETRY_ATTEMPTS, statusCode, sanitizeErrorBody(e.getResponseBodyAsString()));
                        throw e;
                    }
                } else {
                    // Non-retryable server error
                    throw e;
                }
            } catch (HttpClientErrorException e) {
                // Never retry 4xx client errors (bad request, auth issues, etc.)
                throw e;
            }
        }

        // Should never reach here, but throw last exception if we do
        if (lastException != null) {
            if (lastException instanceof HttpServerErrorException) {
                throw (HttpServerErrorException) lastException;
            }
            throw new RuntimeException("Gemini API failed after retries", lastException);
        }
        throw new RuntimeException("Gemini API call failed");
    }

    /**
     * Calls the Gemini REST API and returns the generated text.
     * Uses the generateContent endpoint with gemini-3.6-flash.
     */
    @SuppressWarnings("unchecked")
    private String callGeminiApi(String promptText) {
        String url = GEMINI_API_URL + "?key=" + geminiApiKey;

        // Build the request body according to Gemini API schema
        Map<String, Object> requestBody = new HashMap<>();

        // Contents array — single user turn
        Map<String, Object> part = new HashMap<>();
        part.put("text", promptText);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));
        content.put("role", "user");

        requestBody.put("contents", List.of(content));

        // Generation config — keep responses focused and short
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("maxOutputTokens", 300);
        requestBody.put("generationConfig", generationConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
            log.error("Gemini API returned status: {}, Response body: {}", 
                    response.getStatusCode(), sanitizeErrorBody(String.valueOf(response.getBody())));
            throw new RuntimeException("Gemini API returned non-OK status: " + response.getStatusCode());
        }

        // Parse response: candidates[0].content.parts[0].text
        try {
            List<Map<String, Object>> candidates =
                    (List<Map<String, Object>>) response.getBody().get("candidates");
            Map<String, Object> firstCandidate = candidates.get(0);
            Map<String, Object> responseContent = (Map<String, Object>) firstCandidate.get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) responseContent.get("parts");
            return (String) parts.get(0).get("text");
        } catch (Exception e) {
            log.error("Failed to parse Gemini API response. Status: {}, Body: {}", 
                    response.getStatusCode(), sanitizeErrorBody(String.valueOf(response.getBody())), e);
            throw new RuntimeException("Failed to parse Gemini API response", e);
        }
    }

    /**
     * Sanitizes error response body to prevent logging of sensitive information.
     * This method ensures API keys and credentials are never logged.
     */
    private String sanitizeErrorBody(String body) {
        if (body == null || body.isBlank()) {
            return "[empty response]";
        }
        // Truncate very long error messages
        if (body.length() > 500) {
            return body.substring(0, 500) + "... [truncated]";
        }
        return body;
    }

    /**
     * Builds a full profile response with a safe public snapshot but no AI text,
     * only an error message. Used when Gemini is unavailable but the user was found.
     */
    private AIProfileResponse buildProfileWithError(User user, boolean isCoach, String errorMessage) {
        AIProfileResponse r = buildProfileResponse(user, isCoach, null);
        r.setError(errorMessage);
        return r;
    }

    /**
     * Assembles the AIProfileResponse from a User entity.
     * ONLY safe, public fields are included — email, password, authId,
     * and dateOfBirth are deliberately excluded.
     */
    private AIProfileResponse buildProfileResponse(User user, boolean isCoach, String aiSummary) {
        return AIProfileResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .role(user.getRole() != null ? user.getRole().toUpperCase() : "USER")
                .sport(user.getSport())
                .occupation(user.getOccupation())
                .occupationName(user.getOccupationName())
                .totalPoints(user.getTotalPoints() != null ? user.getTotalPoints() : 0)
                .bio(user.getBio())
                .profileImageUrl(user.getProfileImageUrl())
                // Coach-specific — will be null for athletes
                .academyName(isCoach ? user.getAcademyName() : null)
                .experience(isCoach ? user.getExperience() : null)
                // AI content
                .aiSummary(aiSummary)
                .build();
    }

    // ── Utility helpers ─────────────────────────────────────────────────────

    private static String nullSafe(String s) {
        return s != null ? s : "";
    }

    private static boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }
}
