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
 * Provides strict @[username] Summary formatting with Gemini API
 * and deterministic fallback generation.
 */
@Service
public class AIService {

    private static final Logger log = LoggerFactory.getLogger(AIService.class);

    private static final String GEMINI_API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

    private static final int MAX_POSTS_IN_CONTEXT = 5;
    private static final int MAX_RETRY_ATTEMPTS = 3;
    private static final long INITIAL_BACKOFF_MS = 1000;

    private static final List<String> SPECIALIZATION_KEYWORDS = Arrays.asList(
            "singles", "doubles", "mixed doubles", "relay", "sprint", "marathon",
            "freestyle", "backstroke", "breaststroke", "butterfly", "medley",
            "kata", "kumite", "team", "individual"
    );

    private static final Pattern ORG_PATTERN = Pattern.compile(
            "(?:from|at|representing|for|of|school|college|academy|club|institute)\\s+([A-Z][\\w'\\s]{2,50}?)(?:[,.]|$)",
            Pattern.CASE_INSENSITIVE
    );

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Autowired
    private UserService userService;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private RestTemplate restTemplate;

    public AIProfileResponse generateProfileSummary(String username, String question) {
        Optional<User> userOpt = userService.findByUsername(username);
        if (userOpt.isEmpty()) {
            log.warn("AI profile lookup: username '{}' not found", username);
            return AIProfileResponse.builder()
                    .error("User @" + username + " was not found on Athvexa.")
                    .build();
        }

        User user = userOpt.get();
        boolean isCoach = "COACH".equalsIgnoreCase(user.getRole());

        List<Post> recentPosts = postRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .limit(MAX_POSTS_IN_CONTEXT)
                .collect(Collectors.toList());

        List<String> achievements = deriveAchievements(recentPosts);
        String category = deriveCategory(recentPosts);
        String specialization = deriveSpecialization(recentPosts, user.getSport());
        String organizationName = deriveOrganizationName(user, isCoach, recentPosts);

        String aiText = null;
        if (notBlank(geminiApiKey) && !"your_gemini_api_key_here".equals(geminiApiKey)) {
            try {
                String prompt = buildPrompt(user, isCoach, recentPosts, question);
                aiText = callGeminiApiWithRetry(prompt);
                aiText = cleanAndValidateGeminiResponse(aiText, user.getUsername());
            } catch (Exception e) {
                log.warn("Gemini API call failed for user '@{}'. Falling back to deterministic summary. Reason: {}",
                        username, e.getMessage());
                aiText = null;
            }
        }

        if (!notBlank(aiText)) {
            aiText = generateDeterministicSummary(user, recentPosts);
        }

        return buildProfileResponse(user, isCoach, organizationName, achievements,
                category, specialization, aiText);
    }

    private String generateDeterministicSummary(User user, List<Post> posts) {
        StringBuilder sb = new StringBuilder();

        // 1. Header line
        sb.append("@").append(user.getUsername()).append(" Summary:\n\n");

        // 2. Role and Sport line
        String roleStr = null;
        if (notBlank(user.getRole())) {
            String rawRole = user.getRole().trim().toUpperCase();
            if ("COACH".equals(rawRole)) {
                roleStr = "Coach";
            } else if ("ATHLETE".equals(rawRole) || "USER".equals(rawRole) || "PLAYER".equals(rawRole)) {
                roleStr = "Athlete";
            } else {
                roleStr = rawRole.substring(0, 1).toUpperCase() + rawRole.substring(1).toLowerCase();
            }
        }

        String derivedSport = notBlank(user.getSport()) ? user.getSport().trim() : deriveSportFromPosts(posts);
        String sportStr = formatSportName(derivedSport);

        if (roleStr != null && sportStr != null) {
            sb.append(roleStr).append(" in ").append(sportStr).append(".\n\n");
        } else if (roleStr != null) {
            sb.append(roleStr).append(".\n\n");
        } else if (sportStr != null) {
            sb.append("In ").append(sportStr).append(".\n\n");
        }

        // 3. Short summary of actual achievements/posts
        String achievementsSummary = buildAchievementsSummaryFallback(posts);
        if (notBlank(achievementsSummary)) {
            sb.append(achievementsSummary).append("\n\n");
        }

        // 4. Current points line
        if (user.getTotalPoints() != null) {
            sb.append("Current points: ").append(user.getTotalPoints()).append(".");
        } else if (sb.length() >= 2 && sb.substring(sb.length() - 2).equals("\n\n")) {
            sb.setLength(sb.length() - 2);
        }

        return sb.toString().trim();
    }

    private String buildAchievementsSummaryFallback(List<Post> posts) {
        if (posts == null || posts.isEmpty()) {
            return null;
        }

        Set<String> levels = new LinkedHashSet<>();
        Set<String> details = new LinkedHashSet<>();

        for (Post p : posts) {
            if (p.getAchievementLevel() != null) {
                String lvlName = p.getAchievementLevel().getDisplayName();
                if (lvlName.contains("Local Level")) {
                    lvlName = "Local Level";
                }
                levels.add(lvlName);
            }
            if (notBlank(p.getCategory())) {
                details.add(p.getCategory().trim());
            }

            String formattedPos = formatPosition(p.getPosition());
            if (notBlank(formattedPos)) {
                details.add(formattedPos);
            }

            if (notBlank(p.getDescription())) {
                String desc = p.getDescription().trim();
                String descLower = desc.toLowerCase();
                for (String kw : SPECIALIZATION_KEYWORDS) {
                    if (descLower.contains(kw)) {
                        String kwCap = kw.substring(0, 1).toUpperCase() + kw.substring(1);
                        String postSport = formatSportName(p.getSport());
                        if (postSport != null) {
                            details.add(postSport + " " + kwCap);
                        } else {
                            details.add(kwCap);
                        }
                    }
                }
            }
        }

        if (levels.isEmpty() && details.isEmpty()) {
            List<String> descs = posts.stream()
                    .map(Post::getDescription)
                    .filter(this::notBlank)
                    .map(String::trim)
                    .limit(2)
                    .collect(Collectors.toList());
            if (descs.isEmpty()) {
                return null;
            }
            return "Has shared posts: " + String.join("; ", descs) + ".";
        }

        StringBuilder sb = new StringBuilder("Has shared achievements");
        if (!levels.isEmpty()) {
            sb.append(" from ").append(joinWithAnd(levels)).append(" competitions");
        }
        if (!details.isEmpty()) {
            sb.append(", including ").append(String.join(", ", details));
        }
        sb.append(".");
        return sb.toString();
    }

    private String deriveSportFromPosts(List<Post> posts) {
        if (posts == null || posts.isEmpty()) return null;
        return posts.stream()
                .map(Post::getSport)
                .filter(this::notBlank)
                .findFirst()
                .orElse(null);
    }

    private String formatPosition(String pos) {
        if (pos == null || pos.isBlank()) return null;
        String trimmed = pos.trim();
        if (trimmed.matches("\\d+")) {
            int n = Integer.parseInt(trimmed);
            if (n == 1) return "1st Place";
            if (n == 2) return "2nd Place";
            if (n == 3) return "3rd Place";
            return n + "th Place";
        }
        return trimmed;
    }

    private String formatSportName(String sport) {
        if (!notBlank(sport)) return null;
        String s = sport.trim();
        if ("tabletennis".equalsIgnoreCase(s)) return "Table Tennis";
        if ("badminton".equalsIgnoreCase(s)) return "Badminton";
        if ("cricket".equalsIgnoreCase(s)) return "Cricket";
        if ("football".equalsIgnoreCase(s)) return "Football";
        if ("tennis".equalsIgnoreCase(s)) return "Tennis";
        if ("basketball".equalsIgnoreCase(s)) return "Basketball";
        if ("volleyball".equalsIgnoreCase(s)) return "Volleyball";
        if ("athletics".equalsIgnoreCase(s)) return "Athletics";
        if ("swimming".equalsIgnoreCase(s)) return "Swimming";
        if ("chess".equalsIgnoreCase(s)) return "Chess";
        if ("carrom".equalsIgnoreCase(s)) return "Carrom";
        return s.substring(0, 1).toUpperCase() + s.substring(1);
    }

    private String joinWithAnd(Collection<String> items) {
        if (items == null || items.isEmpty()) return "";
        List<String> list = new ArrayList<>(items);
        if (list.size() == 1) return list.get(0);
        if (list.size() == 2) return list.get(0) + " and " + list.get(1);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) {
                if (i == list.size() - 1) {
                    sb.append(" and ");
                } else {
                    sb.append(", ");
                }
            }
            sb.append(list.get(i));
        }
        return sb.toString();
    }

    private String cleanAndValidateGeminiResponse(String text, String username) {
        if (!notBlank(text)) return null;

        String cleaned = text.trim();
        if (cleaned.startsWith("```")) {
            int firstNewline = cleaned.indexOf("\n");
            if (firstNewline != -1) {
                cleaned = cleaned.substring(firstNewline + 1);
            }
            if (cleaned.endsWith("```")) {
                cleaned = cleaned.substring(0, cleaned.length() - 3);
            }
            cleaned = cleaned.trim();
        }

        String headerTarget = "@" + username + " Summary:";
        int headerIdx = cleaned.indexOf(headerTarget);
        if (headerIdx == -1) {
            String lowerCleaned = cleaned.toLowerCase();
            String lowerTarget = ("@" + username + " summary:").toLowerCase();
            headerIdx = lowerCleaned.indexOf(lowerTarget);
        }

        if (headerIdx != -1) {
            cleaned = cleaned.substring(headerIdx).trim();
        } else {
            cleaned = "@" + username + " Summary:\n\n" + cleaned;
        }

        return cleaned;
    }

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
            if (notBlank(p.getDescription())) {
                String desc = p.getDescription().trim();
                if (desc.length() > 120) desc = desc.substring(0, 120) + "...";
                sb.append(" — ").append(desc);
            }
            return sb.length() > 0 ? sb.toString() : null;
        }).filter(Objects::nonNull).collect(Collectors.toList());
    }

    private String deriveCategory(List<Post> posts) {
        if (posts == null || posts.isEmpty()) return null;
        return posts.stream()
                .map(Post::getCategory)
                .filter(this::notBlank)
                .findFirst()
                .orElse(null);
    }

    private String deriveSpecialization(List<Post> posts, String baseSport) {
        if (posts == null || posts.isEmpty()) return null;

        for (Post post : posts) {
            String desc = post.getDescription();
            if (!notBlank(desc)) continue;
            String descLower = desc.toLowerCase();

            for (String keyword : SPECIALIZATION_KEYWORDS) {
                if (descLower.contains(keyword)) {
                    String sport = notBlank(post.getSport()) ? post.getSport()
                            : (notBlank(baseSport) ? baseSport : null);
                    if (sport != null) {
                        String kw = keyword.substring(0, 1).toUpperCase() + keyword.substring(1);
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

    private String deriveOrganizationName(User user, boolean isCoach, List<Post> posts) {
        if (notBlank(user.getAcademyName())) {
            return user.getAcademyName();
        }

        if (posts != null) {
            for (Post post : posts) {
                if (!notBlank(post.getDescription())) continue;
                Matcher m = ORG_PATTERN.matcher(post.getDescription());
                if (m.find()) {
                    String candidate = m.group(1).trim();
                    if (candidate.length() >= 3) {
                        return candidate;
                    }
                }
            }
        }

        return null;
    }

    private String buildPrompt(User user, boolean isCoach, List<Post> posts, String question) {
        StringBuilder sb = new StringBuilder();

        sb.append("=== ATHVEXA USER PROFILE DATA ===\n");
        sb.append("Username: ").append(user.getUsername()).append("\n");
        String roleStr = isCoach ? "Coach" : "Athlete";
        sb.append("Role: ").append(roleStr).append("\n");

        String derivedSport = notBlank(user.getSport()) ? user.getSport().trim() : deriveSportFromPosts(posts);
        String sportStr = formatSportName(derivedSport);

        if (notBlank(sportStr)) {
            sb.append("Sport: ").append(sportStr).append("\n");
        }
        if (user.getTotalPoints() != null) {
            sb.append("Points: ").append(user.getTotalPoints()).append("\n");
        }

        if (posts != null && !posts.isEmpty()) {
            sb.append("Recent Achievement Posts:\n");
            for (Post p : posts) {
                sb.append("- ");
                if (p.getAchievementLevel() != null) {
                    sb.append("Level: ").append(p.getAchievementLevel().getDisplayName()).append("; ");
                }
                if (notBlank(p.getSport())) {
                    sb.append("Sport: ").append(formatSportName(p.getSport())).append("; ");
                }
                if (notBlank(p.getPosition())) {
                    sb.append("Position: ").append(formatPosition(p.getPosition())).append("; ");
                }
                if (notBlank(p.getCategory())) {
                    sb.append("Category: ").append(p.getCategory()).append("; ");
                }
                if (notBlank(p.getDescription())) {
                    sb.append("Description: ").append(p.getDescription()).append("; ");
                }
                sb.append("\n");
            }
        } else {
            sb.append("Recent Achievement Posts: None\n");
        }

        sb.append("\n=== INSTRUCTIONS ===\n");
        sb.append("You are an AI assistant for the Athvexa sports platform.\n");
        sb.append("Generate an AI profile summary for @").append(user.getUsername()).append(" strictly following this EXACT structure:\n\n");
        sb.append("@").append(user.getUsername()).append(" Summary:\n\n");
        sb.append("[Role] in [Sport].\n\n");
        sb.append("[Short summary of actual achievements/posts.]\n\n");
        sb.append("Current points: [points].\n\n");

        sb.append("STRICT RULES:\n");
        sb.append("1. Use ONLY real data provided above. NEVER invent, assume, or guess any information.\n");
        sb.append("2. Do not guess gender, organization, specialization, or achievements.\n");
        sb.append("3. If Role, Sport, achievements, or points are missing, OMIT that corresponding line/sentence rather than inventing it.\n");
        sb.append("4. Format Role as 'Athlete' or 'Coach'.\n");
        sb.append("5. Use the user's actual username (@").append(user.getUsername()).append(") and actual points.\n");
        sb.append("6. Keep the achievement summary short and factual (1-2 sentences). Maximum 3-4 sentences total.\n");
        sb.append("7. Output MUST start directly with @").append(user.getUsername()).append(" Summary:\n");
        sb.append("8. Do NOT include extra conversational text before or after the summary.\n");

        if (notBlank(question)) {
            sb.append("\nUser query context: ").append(question.trim()).append(" (Answer factually within the required format).\n");
        }

        return sb.toString();
    }

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

                if (statusCode >= 500 && statusCode < 600) {
                    if (attempt < MAX_RETRY_ATTEMPTS) {
                        long backoffMs = INITIAL_BACKOFF_MS * (1L << (attempt - 1));
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

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("maxOutputTokens", 400);
        generationConfig.put("temperature", 0.2);
        requestBody.put("generationConfig", generationConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
            log.error("Gemini API returned status: {}", response.getStatusCode());
            throw new RuntimeException("Gemini API returned non-OK status: " + response.getStatusCode());
        }

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
                .experience(isCoach && notBlank(user.getExperience()) ? user.getExperience() : null)
                .achievements(achievements)
                .category(category)
                .specialization(specialization)
                .aiSummary(aiSummary)
                .build();
    }

    private boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }
}
