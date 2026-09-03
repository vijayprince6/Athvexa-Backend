import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import AIProfileCard from './AIProfileCard';

/**
 * MentionSearch
 *
 * A smart search bar that accepts @username or plain username mentions and
 * calls the backend AI profile-summary endpoint.
 *
 * Supported input patterns:
 *   vijayprince              (plain username)
 *   @vijayprince             (@username)
 *   @vijayprince what sport does he play?  (with optional question)
 *
 * The Gemini API key NEVER touches this component — all AI logic is
 * handled server-side by AIController + AIService.
 */
const MentionSearch = () => {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [parseError, setParseError] = useState('');

  const inputRef = useRef(null);

  // ── Input parsing ─────────────────────────────────────────────────────────
  /**
   * Parses the user's input into { username, question }.
   * Returns null if the input is blank or contains invalid characters.
   *
   * Accepts:
   *   "vijayprince"                    → { username: "vijayprince", question: null }
   *   "@vijayprince"                   → { username: "vijayprince", question: null }
   *   "@vijayprince what sport?"       → { username: "vijayprince", question: "what sport?" }
   */
  const parseInput = (raw) => {
    const trimmed = raw.trim();
    if (!trimmed) return null;

    // Strip leading @ if present
    const withoutAt = trimmed.startsWith('@') ? trimmed : ('@' + trimmed);

    // Match @username (alphanumeric + underscore + dot + hyphen)
    const match = withoutAt.match(/^@([a-zA-Z0-9_.@-]+)([\s\S]*)$/);
    if (!match) return null;

    const username = match[1].trim();
    if (!username) return null;

    const rest = match[2].trim();

    return {
      username,
      question: rest.length > 0 ? rest : null,
    };
  };

  // ── API call ──────────────────────────────────────────────────────────────
  const handleSearch = useCallback(async () => {
    const parsed = parseInput(inputValue);

    if (!parsed) {
      setParseError('Enter a username or @username. Example: vijayprince or @vijayprince');
      return;
    }

    setParseError('');
    setResult(null);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/ai/profile-summary',
        { username: parsed.username, question: parsed.question },
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
    setParseError('');
    if (inputRef.current) inputRef.current.focus();
  };

  // ── Inline styles ────────────────────────────────────────────────────────
  const wrapperStyle = {
    width: '100%',
    maxWidth: 640,
    margin: '0 auto 24px',
    fontFamily: "'Segoe UI', Roboto, sans-serif",
  };

  const searchBarStyle = {
    display: 'flex',
    alignItems: 'center',
    background: '#ffffff',
    border: '1.5px solid #e2e8f0',
    borderRadius: 14,
    padding: '10px 14px',
    gap: 10,
    boxShadow: '0 2px 12px rgba(102, 126, 234, 0.08)',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const inputStyle = {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: 15,
    color: '#2d3748',
    background: 'transparent',
    fontFamily: 'inherit',
    minWidth: 0,
  };

  const searchBtnStyle = {
    padding: '8px 18px',
    borderRadius: 10,
    border: 'none',
    background: loading
      ? '#a0aec0'
      : 'linear-gradient(45deg, #667eea, #764ba2)',
    color: '#fff',
    fontWeight: 700,
    fontSize: 14,
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'opacity 0.2s',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  };

  const hintStyle = {
    fontSize: 12,
    color: '#a0aec0',
    marginTop: 6,
    paddingLeft: 4,
    fontStyle: 'italic',
  };

  const parseErrStyle = {
    fontSize: 12,
    color: '#e53e3e',
    marginTop: 6,
    paddingLeft: 4,
  };

  // ── Loading skeleton ─────────────────────────────────────────────────────
  const SkeletonCard = () => (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .skeleton-line {
          background: linear-gradient(90deg, #f0f0f5 25%, #e8e8ef 50%, #f0f0f5 75%);
          background-size: 800px 100%;
          animation: shimmer 1.4s infinite linear;
          border-radius: 8px;
        }
      `}</style>
      <div style={{
        background: '#ffffff',
        border: '1px solid #e8ecff',
        borderRadius: 20,
        padding: '24px',
        marginTop: 16,
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div className="skeleton-line" style={{ width: 56, height: 56, borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton-line" style={{ height: 16, width: '55%', marginBottom: 8 }} />
            <div className="skeleton-line" style={{ height: 12, width: '30%' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          {[80, 90, 100].map((w, i) => (
            <div key={i} className="skeleton-line" style={{ height: 28, width: w, borderRadius: 20 }} />
          ))}
        </div>
        <div style={{ height: 1, background: '#f0f3ff', margin: '12px 0' }} />
        <div style={{ background: '#f8f9ff', borderRadius: 14, padding: '14px 16px' }}>
          <div className="skeleton-line" style={{ height: 12, width: '25%', marginBottom: 12 }} />
          <div className="skeleton-line" style={{ height: 13, width: '95%', marginBottom: 8 }} />
          <div className="skeleton-line" style={{ height: 13, width: '85%', marginBottom: 8 }} />
          <div className="skeleton-line" style={{ height: 13, width: '70%' }} />
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <div className="skeleton-line" style={{ flex: 1, height: 42, borderRadius: 12 }} />
          <div className="skeleton-line" style={{ flex: 1, height: 42, borderRadius: 12 }} />
        </div>
      </div>
    </>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={wrapperStyle}>
      {/* Search bar */}
      <div style={searchBarStyle}>
        {/* @ icon prefix */}
        <span style={{ fontSize: 18, color: '#667eea', flexShrink: 0, userSelect: 'none' }}>@</span>

        <input
          ref={inputRef}
          id="ai-mention-search-input"
          type="text"
          placeholder="Enter username or @username"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setParseError('');
          }}
          onKeyDown={handleKeyDown}
          style={inputStyle}
          autoComplete="off"
          spellCheck={false}
        />

        {/* Clear button — shows when there is content */}
        {inputValue.length > 0 && !loading && (
          <button
            onClick={handleClear}
            style={{
              border: 'none',
              background: 'none',
              fontSize: 18,
              cursor: 'pointer',
              color: '#a0aec0',
              padding: '0 4px',
              flexShrink: 0,
            }}
            title="Clear"
          >
            ×
          </button>
        )}

        <button
          id="ai-mention-search-btn"
          style={searchBtnStyle}
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? '⏳' : '✨ Ask AI'}
        </button>
      </div>

      {/* Hint text */}
      {!parseError && !result && !loading && (
        <div style={hintStyle}>
          Mention an Athvexa user to get an AI-powered profile summary
        </div>
      )}

      {/* Parse error */}
      {parseError && <div style={parseErrStyle}>⚠ {parseError}</div>}

      {/* Loading skeleton */}
      {loading && <SkeletonCard />}

      {/* Result card */}
      {!loading && result && (
        <AIProfileCard data={result} onClose={handleClear} />
      )}
    </div>
  );
};

export default MentionSearch;
