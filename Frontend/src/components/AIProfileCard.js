import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * AIProfileCard
 *
 * Renders the structured AI profile card for a searched user.
 * Displays the format specified in the Ask AI feature requirements:
 *
 * For Athlete/Player:
 *   🏅 Player — {name}
 *   ✨ AI Summary (2-3 lines)
 *   1. Name
 *   2. Username
 *   3. Sport
 *   4. Occupation
 *   5. Points
 *   6. Organization
 *   7. Achievements
 *   8. Category
 *   9. Specialization
 *
 * For Coach:
 *   👨‍🏫 Coach — {name}
 *   ✨ AI Summary (2-3 lines)
 *   1. Name ... 7. Coaching role ... 8. Achievements ... 9. Experience
 *
 * Props:
 *   data    — AIProfileResponse object from the backend
 *   onClose — callback to dismiss/clear the card (optional)
 */
const AIProfileCard = ({ data, onClose }) => {
  const navigate = useNavigate();

  if (!data) return null;

  // ── User not found — special error state ──────────────────────────────────
  const isUserNotFound = data.error && !data.username && !data.userId;
  if (isUserNotFound) {
    return (
      <div style={{
        marginTop: 16,
        background: 'linear-gradient(135deg, #fff5f5, #fff0f0)',
        border: '1.5px solid #fed7d7',
        borderRadius: 18,
        padding: '24px 20px',
        textAlign: 'center',
        position: 'relative',
        fontFamily: "'Segoe UI', Roboto, 'Inter', sans-serif",
      }}>
        {onClose && (
          <button onClick={onClose} style={closeBtnBase} title="Dismiss">×</button>
        )}
        <div style={{ fontSize: 40, marginBottom: 10 }}>❌</div>
        <div style={{ fontWeight: 700, fontSize: 18, color: '#c53030', marginBottom: 6 }}>
          User not found
        </div>
        <div style={{ fontSize: 14, color: '#742a2a', lineHeight: 1.6 }}>
          Please enter a valid Athvexa username.
        </div>
      </div>
    );
  }

  const isCoach = data.role === 'COACH';

  // ── Sport emoji map ───────────────────────────────────────────────────────
  const sportEmojis = {
    archery: '🏹', athletics: '🏃', badminton: '🏸', baseball: '⚾',
    basketball: '🏀', boxing: '🥊', carrom: '🎯', chess: '♟️',
    cricket: '🏏', cycling: '🚴', fencing: '🤺', football: '⚽',
    golf: '⛳', gymnastics: '🤸', handball: '🤾', hockey: '🏑',
    icehockey: '🏒', judo: '🤼', kabaddi: '🤼', karate: '🥋',
    rugby: '🏉', skating: '⛸️', snooker: '🎱', surfing: '🏄',
    swimming: '🏊', tabletennis: '🏓', tennis: '🎾', volleyball: '🏐',
    weightlifting: '🏋️', wrestling: '🤼', horseriding: '🏇',
  };
  const sportEmoji = data.sport
    ? (sportEmojis[data.sport.toLowerCase().replace(/\s/g, '')] || '🏅')
    : '🏅';

  const getInitials = (name) => {
    if (!name) return 'U';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.trim().charAt(0).toUpperCase();
  };

  const handleChat = () => {
    navigate('/chat', {
      state: {
        selectedUser: {
          id: data.userId,
          name: data.name,
          username: data.username,
          profileImageUrl: data.profileImageUrl,
        },
      },
    });
  };

  const handleViewProfile = () => {
    navigate(`/profile/${data.userId}`);
  };

  // ── Determine role display label ──────────────────────────────────────────
  const roleEmoji = isCoach ? '👨‍🏫' : '🏅';
  const roleLabel = isCoach ? 'Coach' : 'Player';

  // ── Has AI summary? ───────────────────────────────────────────────────────
  const hasAISummary = data.aiSummary && data.aiSummary.trim().length > 0;
  const hasAchievements = data.achievements && data.achievements.length > 0;

  return (
    <>
      <style>{`
        @keyframes ai-card-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ai-card-chat-btn:hover  { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102,126,234,0.42) !important; }
        .ai-card-profile-btn:hover { background: #f0f3ff !important; }
        .ai-profile-list { list-style: none; padding: 0; margin: 0; }
        .ai-profile-list li {
          display: flex;
          gap: 10px;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f8;
          font-size: 14px;
          line-height: 1.55;
          word-break: break-word;
        }
        .ai-profile-list li:last-child { border-bottom: none; }
        .ai-profile-list .ai-list-num {
          font-weight: 700;
          color: #667eea;
          min-width: 22px;
          flex-shrink: 0;
        }
        .ai-profile-list .ai-list-label {
          font-weight: 600;
          color: #4a5568;
          min-width: 120px;
          flex-shrink: 0;
        }
        .ai-profile-list .ai-list-value {
          color: #2d3748;
          flex: 1;
          overflow-wrap: anywhere;
        }
      `}</style>

      <div style={{
        background: 'linear-gradient(145deg, #ffffff, #f8f9ff)',
        border: '1px solid #e8ecff',
        borderRadius: 20,
        padding: '22px 20px',
        marginTop: 16,
        boxShadow: '0 8px 32px rgba(102,126,234,0.11), 0 2px 8px rgba(0,0,0,0.04)',
        position: 'relative',
        fontFamily: "'Segoe UI', Roboto, 'Inter', sans-serif",
        animation: 'ai-card-in 0.32s ease-out',
      }}>

        {/* Close button */}
        {onClose && (
          <button style={closeBtnBase} onClick={onClose} title="Dismiss">×</button>
        )}

        {/* ── Role header: 🏅 Player — Vijay ── */}
        <div style={{
          fontSize: 18,
          fontWeight: 800,
          color: isCoach ? '#b7791f' : '#553c9a',
          marginBottom: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
          paddingRight: 32, // avoid overlap with close btn
        }}>
          <span>{roleEmoji}</span>
          <span>{roleLabel} — {data.name || data.username}</span>
        </div>

        {/* ── Avatar + username row ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 52, height: 52,
            borderRadius: '50%',
            background: isCoach
              ? 'linear-gradient(135deg, #FFD700, #FFA500)'
              : 'linear-gradient(135deg, #667eea, #764ba2)',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 20,
            flexShrink: 0,
            overflow: 'hidden',
            boxShadow: '0 3px 10px rgba(0,0,0,0.14)',
          }}>
            {data.profileImageUrl ? (
              <img
                src={data.profileImageUrl}
                alt={data.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : getInitials(data.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontWeight: 700, fontSize: 16, color: '#1a202c',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {data.name || data.username}
            </div>
            <div style={{ color: '#718096', fontSize: 13, marginTop: 2 }}>
              @{data.username}
            </div>
          </div>
          {/* Role badge */}
          <span style={{
            display: 'inline-block',
            padding: '3px 10px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            background: isCoach
              ? 'linear-gradient(45deg, #FFD700, #FFA500)'
              : 'linear-gradient(45deg, #667eea, #764ba2)',
            color: '#fff',
            flexShrink: 0,
          }}>
            {isCoach ? '🏆 Coach' : '🏅 Athlete'}
          </span>
        </div>

        {/* ── AI Summary section ── */}
        <div style={{
          background: 'linear-gradient(135deg, #f0f3ff, #f5f0ff)',
          border: '1px solid #e0e7ff',
          borderRadius: 14,
          padding: '14px 16px',
          marginBottom: 16,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            marginBottom: 8,
            fontSize: 11, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: 0.9,
            color: '#667eea',
          }}>
            <span>✨</span> AI Summary
          </div>

          {/* AI summary text — always fully shown, no overflow hiding */}
          {hasAISummary ? (
            <div style={{
              fontSize: 14.5,
              lineHeight: 1.7,
              color: '#2d3748',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
              overflowWrap: 'anywhere',
            }}>
              {data.aiSummary}
            </div>
          ) : data.error ? (
            <div style={{ fontSize: 14, color: '#c53030', lineHeight: 1.6 }}>
              ⚠️ {data.error}
            </div>
          ) : (
            <div style={{
              fontSize: 14,
              color: '#718096',
              lineHeight: 1.6,
              fontStyle: 'italic',
            }}>
              No verified achievements or certificates have been posted by this user yet.
              There is currently no sports achievement data available to summarize.
            </div>
          )}

          {/* Show error alongside summary if both present */}
          {hasAISummary && data.error && (
            <div style={{
              marginTop: 10, padding: '8px 12px',
              background: 'rgba(254,215,215,0.7)',
              borderRadius: 8, fontSize: 13,
              color: '#c53030', lineHeight: 1.5,
            }}>
              ⚠️ {data.error}
            </div>
          )}
        </div>

        {/* ── Structured numbered list ── */}
        <ul className="ai-profile-list">

          <li>
            <span className="ai-list-num">1.</span>
            <span className="ai-list-label">Name</span>
            <span className="ai-list-value">{data.name || '—'}</span>
          </li>

          <li>
            <span className="ai-list-num">2.</span>
            <span className="ai-list-label">Username</span>
            <span className="ai-list-value">@{data.username}</span>
          </li>

          {data.sport && (
            <li>
              <span className="ai-list-num">3.</span>
              <span className="ai-list-label">Sport</span>
              <span className="ai-list-value">{data.sport} {sportEmoji}</span>
            </li>
          )}

          <li>
            <span className="ai-list-num">4.</span>
            <span className="ai-list-label">Occupation</span>
            <span className="ai-list-value">
              {isCoach ? 'Coach' : (data.occupation || 'Player / Athlete')}
              {data.occupationName ? ` (${data.occupationName})` : ''}
            </span>
          </li>

          <li>
            <span className="ai-list-num">5.</span>
            <span className="ai-list-label">Points</span>
            <span className="ai-list-value">
              ⭐ {data.totalPoints !== null && data.totalPoints !== undefined
                ? `${data.totalPoints} pts`
                : '0 pts'}
            </span>
          </li>

          {/* ── Athlete-specific fields ── */}
          {!isCoach && (
            <>
              {/* Field #6: Organization (if exists) OR Specialization (if no org) */}
              {data.organizationName && (
                <li>
                  <span className="ai-list-num">6.</span>
                  <span className="ai-list-label">Organization</span>
                  <span className="ai-list-value">{data.organizationName}</span>
                </li>
              )}

              {/* Field #7: Achievements - always shown for athletes */}
              {hasAchievements ? (
                <li style={{ alignItems: 'flex-start' }}>
                  <span className="ai-list-num">7.</span>
                  <span className="ai-list-label">Achievements</span>
                  <span className="ai-list-value">
                    {data.achievements.map((ach, i) => (
                      <span key={i} style={{ display: 'block', marginBottom: i < data.achievements.length - 1 ? 4 : 0 }}>
                        • {ach}
                      </span>
                    ))}
                  </span>
                </li>
              ) : (
                <li>
                  <span className="ai-list-num">7.</span>
                  <span className="ai-list-label">Achievements</span>
                  <span className="ai-list-value" style={{ color: '#a0aec0', fontStyle: 'italic' }}>
                    No verified achievements posted yet
                  </span>
                </li>
              )}

              {/* Field #8: Category (if exists) */}
              {data.category && (
                <li>
                  <span className="ai-list-num">8.</span>
                  <span className="ai-list-label">Category</span>
                  <span className="ai-list-value">{data.category}</span>
                </li>
              )}

              {/* Field #9: Specialization (if exists) */}
              {data.specialization && (
                <li>
                  <span className="ai-list-num">9.</span>
                  <span className="ai-list-label">Specialization</span>
                  <span className="ai-list-value">{data.specialization}</span>
                </li>
              )}
            </>
          )}

          {/* ── Coach-specific fields ── */}
          {isCoach && (
            <>
              {hasAchievements ? (
                <li style={{ alignItems: 'flex-start' }}>
                  <span className="ai-list-num">7.</span>
                  <span className="ai-list-label">Achievements</span>
                  <span className="ai-list-value">
                    {data.achievements.map((ach, i) => (
                      <span key={i} style={{ display: 'block', marginBottom: i < data.achievements.length - 1 ? 4 : 0 }}>
                        • {ach}
                      </span>
                    ))}
                  </span>
                </li>
              ) : (
                <li>
                  <span className="ai-list-num">7.</span>
                  <span className="ai-list-label">Achievements</span>
                  <span className="ai-list-value" style={{ color: '#a0aec0', fontStyle: 'italic' }}>
                    No coaching records or achievements posted yet
                  </span>
                </li>
              )}

              {/* Experience ONLY if actually stored */}
              {data.experience && (
                <li>
                  <span className="ai-list-num">8.</span>
                  <span className="ai-list-label">Experience</span>
                  <span className="ai-list-value">{data.experience}</span>
                </li>
              )}
            </>
          )}

        </ul>


        {/* ── Bio (if available) ── */}
        {data.bio && (
          <div style={{
            marginTop: 12,
            padding: '10px 14px',
            background: '#fafbff',
            borderRadius: 10,
            fontSize: 13.5,
            color: '#4a5568',
            lineHeight: 1.65,
            fontStyle: 'italic',
            borderLeft: '3px solid #c3ceff',
            wordBreak: 'break-word',
          }}>
            "{data.bio}"
          </div>
        )}

        {/* ── Action buttons ── */}
        {data.userId && (
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button
              className="ai-card-chat-btn"
              onClick={handleChat}
              style={{
                flex: 1, padding: '11px 16px', borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                color: '#fff', fontWeight: 700, fontSize: 14,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                boxShadow: '0 4px 12px rgba(102,126,234,0.35)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
            >
              💬 Chat
            </button>
            <button
              className="ai-card-profile-btn"
              onClick={handleViewProfile}
              style={{
                flex: 1, padding: '11px 16px', borderRadius: 12,
                border: '1.5px solid #667eea', background: 'transparent',
                color: '#667eea', fontWeight: 700, fontSize: 14,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'background 0.15s',
              }}
            >
              👤 View Profile
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// Shared close button base style (prevents code duplication)
const closeBtnBase = {
  position: 'absolute',
  top: 14, right: 14,
  width: 30, height: 30,
  borderRadius: '50%',
  border: 'none',
  background: '#f0f0f5',
  color: '#666',
  fontSize: 18,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 1,
  zIndex: 1,
};

export default AIProfileCard;
