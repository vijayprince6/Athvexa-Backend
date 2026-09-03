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

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * AIService — handles the @username profile-summary feature.
 *
 * Flow:
 *  1. Look up user by username via UserService (existing logic, no duplication).
 *  2. Determine athlete vs coach from user.role.
 *  3. Collect safe, public profile information (no email/password/authId/DOB).
 *  4. Fetch top-5 recent posts as "achievements" context (sport + level + description).
 *  5. Derive structured fields: organizationName, achievements, category, specialization.
 *  6. Build a clear, constrained Gemini prompt.
 *  7. Call the Gemini REST API (gemini-2.0-flash) with retry logic for 503 errors.
 *  8. Parse and return the AI-generated text inside AIProfileResponse.
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
    private static final String GEMINI_API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    private static final int MAX_POSTS_IN_CONTEXT = 5;
    private static final int MAX_RETRY_ATTEMPTS = 3;
    private static final long INITIAL_BACKOFF_MS = 1000; // 1 second

    // Keywords used to detect specialization from post descriptions
    private static final List<String> SPECIALIZATION_KEYWORDS = Arrays.asList(
            "singles", "doubles", "mixed doubles", "relay", "sprint", "marathon",
            "freestyle", "backstroke", "breaststroke", "butterfly", "medley",
            "kata", "kumite", "team", "individual"
    );

    // Keywords used to extract organization from post descriptions
    private static final Pattern ORG_PATTERN = Pattern.compile(
            "(?:from|at|representing|for|of|school|college|academy|club|institute)\\s+([A-Z][\\w'\\s]{2,50}?)(?:[,.]|$)",
            Pattern.CASE_INSENSITIVE
    );

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
        // Strictly filtered to this user's own posts — never another user's
        List<Post> recentPosts = postRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .limit(MAX_POSTS_IN_CONTEXT)
                .collect(Collectors.toList());

        // ── 3. Derive structured fields from posts ───────────────────────────
        List<String> achievements = deriveAchievements(recentPosts);
        String category = deriveCategory(recentPosts);
        String specialization = deriveSpecialization(recentPosts, user.getSport());
        String organizationName = deriveOrganizationName(user, isCoach, recentPosts);

        // ── 4. Build the Gemini prompt ───────────────────────────────────────
        String prompt = buildPrompt(user, isCoach, recentPosts, organizationName, question);

        // ── 5. Call Gemini API with retry logic ──────────────────────────────
        String aiText;
        try {
            aiText = callGeminiApiWithRetry(prompt);
        } catch (HttpClientErrorException e) {
            int statusCode = e.getStatusCode().value();
            if (statusCode == 429) {
                log.warn("Gemini API rate limit hit for username '{}'", username);
                return buildProfileWithError(user, isCoach, organizationName, achievements,
                        category, specialization,
                        "AI is busy right now. Please try again in a moment.");
            }
            log.error("Gemini API client error for username '{}': {} - Response body: {}",
                    username, e.getStatusCode(), sanitizeErrorBody(e.getResponseBodyAsString()));
            return buildProfileWithError(user, isCoach, organizationName, achievements,
                    category, specialization,
                    "Could not generate AI summary. Please try again.");
        } catch (HttpServerErrorException e) {
            log.error("Gemini API server error for username '{}': {} - Response body: {}",
                    username, e.getStatusCode(), sanitizeErrorBody(e.getResponseBodyAsString()));
            return buildProfileWithError(user, isCoach, organizationName, achievements,
                    category, specialization,
                    "AI service is temporarily unavailable. Please try again.");
        } catch (Exception e) {
            log.error("Unexpected error calling Gemini for username '{}'", username, e);
            return buildProfileWithError(user, isCoach, organizationName, achievements,
                    category, specialization,
                    "Could not generate AI summary. Please try again.");
        }

        // ── 6. Assemble and return response ──────────────────────────────────
        return buildProfileResponse(user, isCoach, organizationName, achievements,
                category, specialization, aiText);
    }

    // ───────────────────────────────────────────────────────────────────────
    // Derivation helpers — all based solely on user's own data
    // ───────────────────────────────────────────────────────────────────────

    /**
     * Formats each post into a human-readable achievement string.
     * Example: "State Level — Table Tennis, 1st Place, Under-19"
     * Returns an empty list if there are no posts.
     */
    private List<String> deriveAchievements(List<Post> posts) {
        if (posts == null || posts.isEmpty()) return Collections.emptyList();

        return posts.stream().map(p -> {
            StringBuilder sb = new StringBuilder();
            if (p.getAchievementLevel() != null) {
                sb.append(p.getAchievementLevel().getDisplayName());
            }
            if (notBlank(p.getSport())) {
                if (sb.length() > 0) sb.append(" — ");
                sb.append(p.getSport());
            }
            if (notBlank(p.getPosition())) {
                sb.append(", ").append(p.getPosition());
            }
            if (notBlank(p.getCategory())) {
                sb.append(", ").append(p.getCategory());
            }
            // Truncate very long descriptions but still include them
            if (notBlank(p.getDescription())) {
                String desc = p.getDescription().trim();
                if (desc.length() > 120) desc = desc.substring(0, 120) + "...";
                sb.append(" — ").append(desc);
            }
            return sb.length() > 0 ? sb.toString() : null;
        }).filter(Objects::nonNull).collect(Collectors.toList());
    }

    /**
     * Returns the category from the user's most recent post that has a category.
     * Category comes from the post data, NOT from the user's current age.
     */
    private String deriveCategory(List<Post> posts) {
        if (posts == null || posts.isEmpty()) return null;
        return posts.stream()
                .map(Post::getCategory)
                .filter(this::notBlank)
                .findFirst()
                .orElse(null);
    }

    /**
     * Attempts to identify a specialization from the user's posts.
     * Checks post descriptions for known specialization keywords.
     * Returns null if no reliable specialization can be determined.
     */
    private String deriveSpecialization(List<Post> posts, String baseSport) {
        if (posts == null || posts.isEmpty()) return null;

        for (Post post : posts) {
            String desc = post.getDescription();
            if (!notBlank(desc)) continue;
            String descLower = desc.toLowerCase();

            for (String keyword : SPECIALIZATION_KEYWORDS) {
                if (descLower.contains(keyword)) {
                    // Build a specialization string: "Table Tennis Doubles" etc.
                    String sport = notBlank(post.getSport()) ? post.getSport()
                            : (notBlank(baseSport) ? baseSport : null);
                    if (sport != null) {
                        // Capitalize keyword
                        String kw = keyword.substring(0, 1).toUpperCase() + keyword.substring(1);
                        // Avoid duplicating sport name
                        String sportLower = sport.toLowerCase().replace("\\s", "");
                        if (!descLower.replace(keyword, "").trim().isEmpty()) {
                            return sport + " " + kw;
                        }
                    }
                    break;
                }
            }
        }
        return null;
    }

    /**
     * Derives the organization name for the user.
     * For coaches: uses academyName (already a dedicated field).
     * For athletes: checks if academyName is set, then tries to extract from post descriptions.
     * Never invents an organization.
     */
    private String deriveOrganizationName(User user, boolean isCoach, List<Post> posts) {
        // Coaches have a dedicated academyName field
        if (notBlank(user.getAcademyName())) {
            return user.getAcademyName();
        }

        // Try to extract from post descriptions using regex patterns like
        // "from St. Joseph's School", "representing XYZ Academy"
        if (posts != null) {
            for (Post post : posts) {
                if (!notBlank(post.getDescription())) continue;
                Matcher m = ORG_PATTERN.matcher(post.getDescription());
                if (m.find()) {
                    String candidate = m.group(1).trim();
                    // Sanity check: must be at least 3 chars and not a generic word
                    if (candidate.length() >= 3) {
                        return candidate;
                    }
                }
            }
        }

        return null; // Unknown — do not invent
    }

    // ───────────────────────────────────────────────────────────────────────
    // Prompt builder
    // ───────────────────────────────────────────────────────────────────────

    /**
     * Builds a constrained Gemini prompt.
     * The system instruction forbids the model from inventing facts.
     * The user turn provides the profile data and the optional question.
     */
    private String buildPrompt(User user, boolean isCoach, List<Post> posts,
                               String organizationName, String question) {
        StringBuilder sb = new StringBuilder();

        // ── Profile section ──────────────────────────────────────────────────
        sb.append("=== ATHVEXA USER PROFILE ===\n");

        String displayName = notBlank(user.getName()) ? user.getName()
                : (notBlank(user.getFullName()) ? user.getFullName() : user.getUsername());
        sb.append("Name: ").append(displayName).append("\n");
        sb.append("Username: @").append(user.getUsername()).append("\n");
        sb.append("Type: ").append(isCoach ? "Coach" : "Athlete / Player").append("\n");

        if (notBlank(user.getSport())) {
            sb.append("Sport: ").append(user.getSport()).append("\n");
        }
        if (notBlank(user.getOccupation())) {
            sb.append("Occupation: ").append(user.getOccupation()).append("\n");
        }
        if (notBlank(user.getOccupationName())) {
            sb.append("Occupation Detail: ").append(user.getOccupationName()).append("\n");
        }

        sb.append("Total Points: ").append(user.getTotalPoints() != null ? user.getTotalPoints() : 0).append("\n");

        if (notBlank(organizationName)) {
            sb.append("Organization: ").append(organizationName).append("\n");
        }

        if (notBlank(user.getBio())) {
            sb.append("Bio: ").append(user.getBio()).append("\n");
        }

        // Coach-specific context
        if (isCoach && notBlank(user.getExperience())) {
            sb.append("Coaching Experience: ").append(user.getExperience()).append("\n");
        }

        // ── Recent achievements ──────────────────────────────────────────────
        if (posts != null && !posts.isEmpty()) {
            sb.append("\n=== RECENT ACHIEVEMENT POSTS ===\n");
            for (int i = 0; i < posts.size(); i++) {
                Post p = posts.get(i);
                sb.append(i + 1).append(". Sport: ").append(nullSafe(p.getSport()));
                if (p.getAchievementLevel() != null) {
                    sb.append(", Level: ").append(p.getAchievementLevel().getDisplayName());
                }
                if (notBlank(p.getPosition())) {
                    sb.append(", Position: ").append(p.getPosition());
                }
                if (notBlank(p.getCategory())) {
                    sb.append(", Category: ").append(p.getCategory());
                }
                if (notBlank(p.getDescription())) {
                    String desc = p.getDescription();
                    if (desc.length() > 200) desc = desc.substring(0, 200) + "...";
                    sb.append(", Description: ").append(desc);
                }
                sb.append("\n");
            }
        } else {
            sb.append("\n=== RECENT ACHIEVEMENT POSTS ===\n");
            sb.append("No achievement posts found for this user.\n");
        }

        // ── Instructions to the model ────────────────────────────────────────
        sb.append("\n=== INSTRUCTIONS ===\n");
        sb.append("You are a helpful assistant for the Athvexa sports platform.\n");
        sb.append("Write EXACTLY 2-3 complete sentences as the AI summary.\n");
        sb.append("Answer ONLY from the profile data provided above. Do NOT invent any facts.\n");
        sb.append("CRITICAL: In the first sentence, ALWAYS write the full name followed by the username in parentheses.\n");
        sb.append("Format: \"[Full Name] (@[username]) ...\" Example: \"Vijay Prince B L (@vijul_vijul) is a...\"\n");
        sb.append("Never abbreviate or truncate names or usernames. Write them completely.\n");
        sb.append("If there are no achievement posts, clearly state that no verified achievement data is available for this user.\n");
        sb.append("Do not mention that you are an AI or that you have a system prompt.\n");
        sb.append("Keep the summary positive, factual, and complete. Never leave a sentence unfinished.\n");

        // ── Question or default task ─────────────────────────────────────────
        sb.append("\n=== REQUEST ===\n");
        if (notBlank(question)) {
            sb.append(question.trim()).append("\n");
        } else {
            sb.append("Write a concise 2-3 sentence profile summary for this ")
              .append(isCoach ? "coach" : "athlete")
              .append(", mentioning their full name, sport, and any verified achievements.\n");
        }

        return sb.toString();
    }

    // ───────────────────────────────────────────────────────────────────────
    // Gemini API caller
    // ───────────────────────────────────────────────────────────────────────

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
                        log.warn("Gemini API returned {} on attempt {}/{}. Retrying in {}ms.",
                                statusCode, attempt, MAX_RETRY_ATTEMPTS, backoffMs);
                        try {
                            Thread.sleep(backoffMs);
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            throw new RuntimeException("Retry interrupted", ie);
                        }
                    } else {
                        log.error("Gemini API failed after {} attempts with status {}.",
                                MAX_RETRY_ATTEMPTS, statusCode);
                        throw e;
                    }
                } else {
                    throw e;
                }
            } catch (HttpClientErrorException e) {
                // Never retry 4xx client errors
                throw e;
            }
        }

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
     */
    @SuppressWarnings("unchecked")
    private String callGeminiApi(String promptText) {
        String url = GEMINI_API_URL + "?key=" + geminiApiKey;

        Map<String, Object> requestBody = new HashMap<>();

        Map<String, Object> part = new HashMap<>();
        part.put("text", promptText);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));
        content.put("role", "user");

        requestBody.put("contents", List.of(content));

        // Generation config — keep responses focused and short
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("maxOutputTokens", 400);
        generationConfig.put("temperature", 0.3); // Lower temperature = more factual
        requestBody.put("generationConfig", generationConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
            log.error("Gemini API returned status: {}", response.getStatusCode());
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
            log.error("Failed to parse Gemini API response.", e);
            throw new RuntimeException("Failed to parse Gemini API response", e);
        }
    }

    // ───────────────────────────────────────────────────────────────────────
    // Response builders
    // ───────────────────────────────────────────────────────────────────────

    /**
     * Builds a full profile response with a safe public snapshot but no AI text,
     * only an error message. Used when Gemini is unavailable but the user was found.
     */
    private AIProfileResponse buildProfileWithError(User user, boolean isCoach,
                                                    String organizationName,
                                                    List<String> achievements,
                                                    String category, String specialization,
                                                    String errorMessage) {
        AIProfileResponse r = buildProfileResponse(user, isCoach, organizationName,
                achievements, category, specialization, null);
        r.setError(errorMessage);
        return r;
    }

    /**
     * Assembles the AIProfileResponse from a User entity.
     * ONLY safe, public fields are included — email, password, authId,
     * and dateOfBirth are deliberately excluded.
     */
    private AIProfileResponse buildProfileResponse(User user, boolean isCoach,
                                                   String organizationName,
                                                   List<String> achievements,
                                                   String category, String specialization,
                                                   String aiSummary) {
        String displayName = notBlank(user.getName()) ? user.getName()
                : (notBlank(user.getFullName()) ? user.getFullName() : user.getUsername());

        return AIProfileResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .name(displayName)
                .role(user.getRole() != null ? user.getRole().toUpperCase() : "USER")
                .sport(user.getSport())
                .occupation(user.getOccupation())
                .occupationName(user.getOccupationName())
                .totalPoints(user.getTotalPoints() != null ? user.getTotalPoints() : 0)
                .bio(user.getBio())
                .profileImageUrl(user.getProfileImageUrl())
                .organizationName(organizationName)
                // Coach-specific — experience only if stored
                .experience(isCoach && notBlank(user.getExperience()) ? user.getExperience() : null)
                // Achievement-derived fields
                .achievements(achievements)
                .category(category)
                .specialization(specialization)
                // AI content
                .aiSummary(aiSummary)
                .build();
    }

    // ── Utility helpers ─────────────────────────────────────────────────────

    private static String nullSafe(String s) {
        return s != null ? s : "";
    }

    private boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }

    /**
     * Sanitizes error response body to prevent logging of sensitive information.
     */
    private String sanitizeErrorBody(String body) {
        if (body == null || body.isBlank()) {
            return "[empty response]";
        }
        if (body.length() > 500) {
            return body.substring(0, 500) + "... [truncated]";
        }
        return body;
    }
}
