package com.athvexa.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

/**
 * Response DTO returned by POST /api/ai/profile-summary
 *
 * Contains safe, public profile information (no email, password, authId, DOB)
 * plus the Gemini-generated AI summary text and structured achievement data.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIProfileResponse {

    // ── Identity (public) ───────────────────────────────────────────────────
    private Long userId;
    private String username;
    private String name;

    /**
     * "USER" for athletes, "COACH" for coaches.
     * Drives how the frontend renders the card and which fields are shown.
     */
    private String role;

    // ── Sports profile (public) ─────────────────────────────────────────────
    private String sport;
    private String occupation;
    private String occupationName;
    private Integer totalPoints;
    private String bio;
    private String profileImageUrl;

    /**
     * The user's organization/school/club.
     * For coaches: academyName field.
     * For athletes: extracted from posts or null (never invented).
     */
    private String organizationName;

    // ── Coach-specific (public, only meaningful when role == "COACH") ────────
    private String experience;

    // ── Achievement data (derived from user's actual posts) ──────────────────
    /**
     * List of formatted achievement strings, e.g.:
     *   "State Level — Table Tennis, 1st Place, Under-19"
     * Only populated from posts that actually belong to this user.
     */
    private List<String> achievements;

    /**
     * Sports category from the user's most recent post (e.g., "Under-19").
     * Null if the user has no posts or no category data in their posts.
     */
    private String category;

    /**
     * Specialization derived from post sport + description (e.g., "Table Tennis Doubles").
     * Null if insufficient data to determine specialization confidently.
     */
    private String specialization;

    // ── AI-generated content ─────────────────────────────────────────────────
    /**
     * The Gemini-generated summary or answer.
     * Populated only from the safe profile context above — never invented facts.
     */
    private String aiSummary;

    // ── Error field (non-null only when something went wrong) ────────────────
    /**
     * Human-readable error message. When non-null, the other fields may be null.
     * Examples:
     *   "User @vijayprince not found on Athvexa."
     *   "AI is busy, please try again in a moment."
     *   "Could not generate summary. Please try again."
     */
    private String error;
}
