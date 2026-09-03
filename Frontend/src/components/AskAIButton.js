import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import AskAIModal from './AskAIModal';

/**
 * AskAIButton
 *
 * A floating "✨ Ask AI" button positioned at the bottom-right corner,
 * visible ONLY on the Home page (/home) for ALL users.
 *
 * Requirements met:
 *   - position: fixed, bottom-right
 *   - Sits above BottomNavbar (bottom: 75px to clear navbar)
 *   - Responsive — works on mobile and desktop
 *   - Visible to ALL users (no authentication check)
 *   - ONLY visible on /home route
 *   - Does not interfere with Chat, Profile, or other navigation
 *   - The Ask AI modal opens on click
 *
 * Z-index layering:
 *   BottomNavbar  → 1000
 *   AskAIButton   → 1001  (above nav bar)
 *   AskAIModal    → 1002  (above button)
 */
const AskAIButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  // Only show the button on the /home route
  if (location.pathname !== '/home') {
    return null;
  }

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <style>{`
        @keyframes ask-ai-fab-pulse {
          0%, 100% { box-shadow: 0 4px 24px rgba(102,126,234,0.45), 0 2px 8px rgba(118,75,162,0.3); }
          50%       { box-shadow: 0 6px 32px rgba(102,126,234,0.65), 0 4px 16px rgba(118,75,162,0.45); }
        }
        #ask-ai-fab-btn {
          animation: ask-ai-fab-pulse 2.8s ease-in-out infinite;
          transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease;
        }
        #ask-ai-fab-btn:hover {
          transform: scale(1.08) translateY(-2px) !important;
          animation: none;
          box-shadow: 0 8px 32px rgba(102,126,234,0.6), 0 4px 16px rgba(118,75,162,0.4) !important;
        }
        #ask-ai-fab-btn:active {
          transform: scale(0.95) !important;
        }
        @media (max-width: 640px) {
          #ask-ai-fab-btn {
            /* On mobile, sit just above the BottomNavbar (~60px tall) */
            bottom: 72px !important;
            right: 16px !important;
          }
        }
      `}</style>

      {/* Floating Action Button */}
      <button
        id="ask-ai-fab-btn"
        onClick={openModal}
        title="Ask AI — Search any Athvexa user"
        aria-label="Ask AI"
        style={{
          position: 'fixed',
          bottom: 75,
          right: 24,
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '13px 20px',
          borderRadius: 50,
          border: 'none',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          fontWeight: 800,
          fontSize: 14.5,
          cursor: 'pointer',
          fontFamily: "'Segoe UI', Roboto, 'Inter', sans-serif",
          letterSpacing: 0.2,
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
          // Shadow applied via animation; fallback for SSR
          boxShadow: '0 4px 24px rgba(102,126,234,0.45)',
        }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>✨</span>
        <span>Ask AI</span>
      </button>

      {/* The modal — rendered via portal-style approach */}
      <AskAIModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
};

export default AskAIButton;
