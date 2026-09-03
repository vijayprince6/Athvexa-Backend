import React, { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import AIProfileCard from './AIProfileCard';

/**
 * AskAIModal
 *
 * A standalone modal/drawer that lets users search any Athvexa username
 * and get an AI-powered profile summary.
 *
 * Accepts:
 *   username         - e.g. "vijul_vijul"
 *   @username        - e.g. "@vijul_vijul"
 *
 * The @ is stripped before sending to the backend.
 * All AI logic is server-side — the Gemini API key never appears here.
 *
 * Props:
 *   isOpen   — boolean, whether the modal is visible
 *   onClose  — callback to close the modal
 */
const AskAIModal = ({ isOpen, onClose }) => {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [validationError, setValidationError] = useState('');

  const inputRef = useRef(null);
  const modalRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 150);
    } else {
      // Reset state when modal closes
      setInputValue('');
      setResult(null);
      setValidationError('');
      setLoading(false);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // ── Input normalization ──────────────────────────────────────────────────
  const normalizeUsername = (raw) => {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    // Accept @username or username — strip leading @
    const stripped = trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
    // Validate: alphanumeric, underscore, dot, hyphen
    if (!/^[a-zA-Z0-9_.@-]+$/.test(stripped)) return null;
    return stripped;
  };

  // ── API call ──────────────────────────────────────────────────────────────
  const handleSearch = useCallback(async () => {
    const username = normalizeUsername(inputValue);

    if (!username) {
      setValidationError('Please enter a valid username. Example: vijul_vijul or @vijul_vijul');
      return;
    }

    setValidationError('');
    setResult(null);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/ai/profile-summary',
        { username, question: null },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      setResult(response.data);
    } catch (err) {
      console.error('AI profile summary request failed:', err);
      setResult({
        error: err.response?.data?.error || 'Could not connect to the server. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }, [inputValue]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) handleSearch();
  };

  const handleClear = () => {
    setInputValue('');
    setResult(null);
    setValidationError('');
    if (inputRef.current) inputRef.current.focus();
  };

  if (!isOpen) return null;

  // ── Loading skeleton ─────────────────────────────────────────────────────
  const SkeletonCard = () => (
    <>
      <style>{`
        @keyframes ask-ai-shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        .ask-ai-skeleton {
          background: linear-gradient(90deg, #f0f0f5 25%, #e8e8ef 50%, #f0f0f5 75%);
          background-size: 800px 100%;
          animation: ask-ai-shimmer 1.4s infinite linear;
          border-radius: 8px;
        }
      `}</style>
      <div style={{
        background: '#fff',
        border: '1px solid #e8ecff',
        borderRadius: 18,
        padding: 20,
        marginTop: 14,
      }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <div className="ask-ai-skeleton" style={{ width: 52, height: 52, borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="ask-ai-skeleton" style={{ height: 14, width: '50%' }} />
            <div className="ask-ai-skeleton" style={{ height: 11, width: '30%' }} />
          </div>
        </div>
        <div style={{ height: 1, background: '#f0f3ff', margin: '10px 0' }} />
        <div style={{ background: '#f8f9ff', borderRadius: 12, padding: '12px 14px' }}>
          <div className="ask-ai-skeleton" style={{ height: 11, width: '20%', marginBottom: 10 }} />
          <div className="ask-ai-skeleton" style={{ height: 12, width: '96%', marginBottom: 7 }} />
          <div className="ask-ai-skeleton" style={{ height: 12, width: '88%', marginBottom: 7 }} />
          <div className="ask-ai-skeleton" style={{ height: 12, width: '72%' }} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <div className="ask-ai-skeleton" style={{ flex: 1, height: 40, borderRadius: 10 }} />
          <div className="ask-ai-skeleton" style={{ flex: 1, height: 40, borderRadius: 10 }} />
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        @keyframes ask-ai-modal-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes ask-ai-modal-slide {
          from { transform: translateY(32px) scale(0.97); opacity: 0; }
          to   { transform: translateY(0) scale(1);       opacity: 1; }
        }
        .ask-ai-search-input:focus-within {
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102,126,234,0.15) !important;
        }
        .ask-ai-search-btn:hover:not(:disabled) {
          opacity: 0.88;
          transform: translateY(-1px);
        }
        .ask-ai-search-btn:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={handleBackdropClick}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 20, 40, 0.55)',
          backdropFilter: 'blur(4px)',
          zIndex: 1002,
          animation: 'ask-ai-modal-fade 0.2s ease-out',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: '0 0 0 0',
        }}
      >
        {/* Modal card */}
        <div
          ref={modalRef}
          style={{
            background: '#fff',
            borderRadius: '24px 24px 0 0',
            padding: '0 0 env(safe-area-inset-bottom,12px) 0',
            width: '100%',
            maxWidth: 640,
            maxHeight: '92vh',
            overflowY: 'auto',
            animation: 'ask-ai-modal-slide 0.28s cubic-bezier(0.34,1.56,0.64,1)',
            boxShadow: '0 -8px 48px rgba(0,0,0,0.18)',
            fontFamily: "'Segoe UI', Roboto, 'Inter', sans-serif",
          }}
        >
          {/* Header bar */}
          <div style={{
            position: 'sticky',
            top: 0,
            background: '#fff',
            borderBottom: '1px solid #f0f0f7',
            padding: '16px 20px 12px',
            zIndex: 2,
            borderRadius: '24px 24px 0 0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>✨</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17, color: '#1a202c', letterSpacing: -0.3 }}>
                    Ask AI
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 1 }}>
                    Search any Athvexa user
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 32, height: 32,
                  borderRadius: '50%',
                  border: 'none',
                  background: '#f4f4f8',
                  color: '#555',
                  fontSize: 18,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1,
                  flexShrink: 0,
                }}
                title="Close"
              >
                ×
              </button>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '16px 20px 24px' }}>

            {/* Search row */}
            <div
              className="ask-ai-search-input"
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#f8f9ff',
                border: '1.5px solid #e2e8f0',
                borderRadius: 14,
                padding: '10px 14px',
                gap: 10,
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            >
              <span style={{ fontSize: 17, color: '#667eea', flexShrink: 0, userSelect: 'none' }}>
                @
              </span>
              <input
                ref={inputRef}
                id="ask-ai-username-input"
                type="text"
                placeholder="Enter username or @username"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setValidationError('');
                }}
                onKeyDown={handleKeyDown}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: 15,
                  color: '#2d3748',
                  background: 'transparent',
                  fontFamily: 'inherit',
                  minWidth: 0,
                }}
                autoComplete="off"
                spellCheck={false}
              />
              {inputValue.length > 0 && !loading && (
                <button
                  onClick={handleClear}
                  style={{
                    border: 'none', background: 'none',
                    fontSize: 18, cursor: 'pointer',
                    color: '#a0aec0', padding: '0 2px', flexShrink: 0,
                  }}
                  title="Clear"
                >
                  ×
                </button>
              )}
              <button
                id="ask-ai-search-btn"
                className="ask-ai-search-btn"
                onClick={handleSearch}
                disabled={loading}
                style={{
                  padding: '9px 18px',
                  borderRadius: 10,
                  border: 'none',
                  background: loading
                    ? '#c0c8e8'
                    : 'linear-gradient(45deg, #667eea, #764ba2)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.2s, transform 0.15s',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {loading ? '⏳' : '🔍 Search'}
              </button>
            </div>

            {/* Hint */}
            {!validationError && !result && !loading && (
              <p style={{
                fontSize: 12,
                color: '#a0aec0',
                marginTop: 8,
                paddingLeft: 2,
                fontStyle: 'italic',
                margin: '8px 0 0 2px',
              }}>
                Type a username and press Search or Enter
              </p>
            )}

            {/* Validation error */}
            {validationError && (
              <p style={{
                fontSize: 13,
                color: '#e53e3e',
                marginTop: 8,
                paddingLeft: 2,
                margin: '8px 0 0 2px',
              }}>
                ⚠ {validationError}
              </p>
            )}

            {/* Loading skeleton */}
            {loading && <SkeletonCard />}

            {/* Result */}
            {!loading && result && (
              <AIProfileCard data={result} onClose={handleClear} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AskAIModal;
