package com.athvexa.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * Response DTO returned by POST /api/ai/profile-summary
 *
 * Contains safe, public profile information (no email, password, authId, DOB)
 * plus the Gemini-generated AI summary text.
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

    // ── Coach-specific (public, only meaningful when role == "COACH") ────────
    private String academyName;
    private String experience;

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
