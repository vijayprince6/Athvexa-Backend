import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * AIProfileCard
 *
 * Renders the AI-generated profile summary card for an @mentioned user.
 *
 * Props:
 *   data  — AIProfileResponse object from the backend
 *   onClose — callback to dismiss/clear the card
 */
const AIProfileCard = ({ data, onClose }) => {
  const navigate = useNavigate();

  if (!data) return null;

  const isCoach = data.role === 'COACH';

  // ── Sport emoji map (matches PostCard.js for consistency) ──────────────
  const sportEmojis = {
    archery: '🏹', athletics: '🏃', badminton: '🏸', baseball: '⚾',
    basketball: '🏀', boxing: '🥊', carrom: '🎯', chess: '♟️',
    cricket: '🏏', cycling: '🚴', fencing: '🤺', football: '⚽',
    golf: '⛳', gymnastics: '🤸', handball: '🤾', hockey: '🏑',
    icehockey: '🏒', judo: '🤼‍♂️', kabaddi: '🤼', karate: '🥋',
    rugby: '🏉', skating: '⛸️', snooker: '🎱', surfing: '🏄',
    swimming: '🏊', tabletennis: '🏓', tennis: '🎾', volleyball: '🏐',
    weightlifting: '🏋️', wrestling: '🤼‍♂️', horseriding: '🏇',
  };

  const sportEmoji = data.sport
    ? (sportEmojis[data.sport.toLowerCase().replace(/\s/g, '')] || '🏅')
    : '🏅';

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.trim().charAt(0).toUpperCase();
  };

  // Navigate to /chat with the user pre-selected (uses existing Chat.js flow)
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

  // ── Inline styles (no Tailwind — matches existing app styling convention) ──
  const cardStyle = {
    background: 'linear-gradient(145deg, #ffffff, #f8f9ff)',
    border: '1px solid #e8ecff',
    borderRadius: 20,
    padding: '24px',
    marginTop: 16,
    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.12), 0 2px 8px rgba(0,0,0,0.05)',
    position: 'relative',
    fontFamily: "'Segoe UI', Roboto, sans-serif",
    animation: 'fadeInUp 0.35s ease-out',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  };

  const avatarStyle = {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: isCoach
      ? 'linear-gradient(135deg, #FFD700, #FFA500)'
      : 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 22,
    flexShrink: 0,
    overflow: 'hidden',
    border: '2px solid rgba(255,255,255,0.8)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  };

  const badgeStyle = {
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
    marginLeft: 6,
  };

  const dividerStyle = {
    height: 1,
    background: 'linear-gradient(90deg, transparent, #e0e5ff, transparent)',
    margin: '14px 0',
  };

  const statRowStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  };

  const statPillStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    background: '#f0f3ff',
    borderRadius: 20,
    padding: '5px 12px',
    fontSize: 13,
    color: '#4a5568',
    fontWeight: 500,
  };

  const aiSectionStyle = {
    background: 'linear-gradient(135deg, #667eea08, #764ba208)',
    border: '1px solid #e8ecff',
    borderRadius: 14,
    padding: '14px 16px',
    marginTop: 14,
  };

  const aiHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#667eea',
  };

  const aiTextStyle = {
    fontSize: 14.5,
    lineHeight: 1.65,
    color: '#2d3748',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
  };

  const errorSectionStyle = {
    background: 'linear-gradient(135deg, #fff5f5, #fff0f0)',
    border: '1px solid #fed7d7',
    borderRadius: 14,
    padding: '12px 16px',
    marginTop: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    color: '#c53030',
  };

  const buttonRowStyle = {
    display: 'flex',
    gap: 10,
    marginTop: 16,
  };

  const chatBtnStyle = {
    flex: 1,
    padding: '11px 16px',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    color: '#fff',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.35)',
    transition: 'transform 0.15s, box-shadow 0.15s',
  };

  const profileBtnStyle = {
    flex: 1,
    padding: '11px 16px',
    borderRadius: 12,
    border: '1.5px solid #667eea',
    background: 'transparent',
    color: '#667eea',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    transition: 'background 0.15s',
  };

  const closeBtnStyle = {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: '50%',
    border: 'none',
    background: '#f0f0f5',
    color: '#666',
    fontSize: 16,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  };

  return (
    <>
      {/* Keyframe animation injected once */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ai-chat-btn:hover  { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102,126,234,0.45) !important; }
        .ai-profile-btn:hover { background: #f0f3ff !important; }
      `}</style>

      <div style={cardStyle}>
        {/* Close button */}
        {onClose && (
          <button style={closeBtnStyle} onClick={onClose} title="Dismiss">
            ×
          </button>
        )}

        {/* ── Header: avatar + name + badges ── */}
        <div style={headerStyle}>
          <div style={avatarStyle}>
            {data.profileImageUrl ? (
              <img
                src={data.profileImageUrl}
                alt={data.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : (
              getInitials(data.name)
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 17, color: '#1a202c' }}>
                {data.name || data.username}
              </span>
              <span style={badgeStyle}>
                {isCoach ? '🏆 Coach' : '🏅 Athlete'}
              </span>
            </div>
            <div style={{ color: '#718096', fontSize: 13, marginTop: 2 }}>
              @{data.username}
            </div>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div style={statRowStyle}>
          {data.sport && (
            <span style={statPillStyle}>
              {sportEmoji} {data.sport}
            </span>
          )}
          {data.totalPoints !== undefined && data.totalPoints !== null && (
            <span style={statPillStyle}>
              ⭐ {data.totalPoints} pts
            </span>
          )}
          {data.occupationName && (
            <span style={statPillStyle}>
              🎓 {data.occupationName}
            </span>
          )}
          {isCoach && data.experience && (
            <span style={statPillStyle}>
              📅 {data.experience} yrs exp
            </span>
          )}
          {isCoach && data.academyName && (
            <span style={statPillStyle}>
              🏫 {data.academyName}
            </span>
          )}
        </div>

        {/* ── Bio ── */}
        {data.bio && (
          <div style={{
            fontSize: 13.5,
            color: '#4a5568',
            lineHeight: 1.6,
            marginBottom: 6,
            fontStyle: 'italic',
          }}>
            "{data.bio}"
          </div>
        )}

        <div style={dividerStyle} />

        {/* ── AI Summary or error ── */}
        {data.error && !data.aiSummary ? (
          <div style={errorSectionStyle}>
            <span>⚠️</span>
            <span>{data.error}</span>
          </div>
        ) : data.error ? (
          <>
            <div style={aiSectionStyle}>
              <div style={aiHeaderStyle}><span>✨</span> AI Summary</div>
              <div style={aiTextStyle}>{data.aiSummary}</div>
            </div>
            <div style={{ ...errorSectionStyle, marginTop: 10 }}>
              <span>⚠️</span>
              <span>{data.error}</span>
            </div>
          </>
        ) : (
          <div style={aiSectionStyle}>
            <div style={aiHeaderStyle}><span>✨</span> AI Summary</div>
            <div style={aiTextStyle}>{data.aiSummary}</div>
          </div>
        )}

        {/* ── Action buttons ── */}
        {data.userId && (
          <div style={buttonRowStyle}>
            <button
              className="ai-chat-btn"
              style={chatBtnStyle}
              onClick={handleChat}
            >
              💬 Chat
            </button>
            <button
              className="ai-profile-btn"
              style={profileBtnStyle}
              onClick={handleViewProfile}
            >
              👤 View Profile
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default AIProfileCard;
