import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavbar from './BottomNavbar';

const Coaches = () => {
  const navigate = useNavigate();

  const sportsOptions = [
    { value: 'archery', label: 'Archery', emoji: '🏹', color: '#ff6b6b' },
    { value: 'athletics', label: 'Athletics (Running)', emoji: '🏃', color: '#4ecdc4' },
    { value: 'badminton', label: 'Badminton', emoji: '🏸', color: '#45b7d1' },
    { value: 'baseball', label: 'Baseball', emoji: '⚾', color: '#96ceb4' },
    { value: 'basketball', label: 'Basketball', emoji: '🏀', color: '#feca57' },
    { value: 'boxing', label: 'Boxing', emoji: '🥊', color: '#ff9ff3' },
    { value: 'carrom', label: 'Carrom', emoji: '🎯', color: '#54a0ff' },
    { value: 'chess', label: 'Chess', emoji: '♟️', color: '#48dbfb' },
    { value: 'cricket', label: 'Cricket', emoji: '🏏', color: '#0abde3' },
    { value: 'cycling', label: 'Cycling', emoji: '🚴', color: '#006ba6' },
    { value: 'fencing', label: 'Fencing', emoji: '🤺', color: '#ee5a24' },
    { value: 'football', label: 'Football (Soccer)', emoji: '⚽', color: '#00d2d3' },
    { value: 'golf', label: 'Golf', emoji: '⛳', color: '#27ae60' },
    { value: 'gymnastics', label: 'Gymnastics', emoji: '🤸', color: '#f39c12' },
    { value: 'handball', label: 'Handball', emoji: '🤾', color: '#e74c3c' },
    { value: 'hockey', label: 'Hockey (Field Hockey)', emoji: '🏑', color: '#3498db' },
    { value: 'icehockey', label: 'Ice Hockey', emoji: '🏒', color: '#5dade2' },
    { value: 'judo', label: 'Judo', emoji: '🤼‍♂️', color: '#af7ac5' },
    { value: 'kabaddi', label: 'Kabaddi', emoji: '🤼', color: '#f4d03f' },
    { value: 'karate', label: 'Karate', emoji: '🥋', color: '#e67e22' },
    { value: 'rugby', label: 'Rugby', emoji: '🏉', color: '#a569bd' },
    { value: 'skating', label: 'Skating', emoji: '⛸️', color: '#85c1e9' },
    { value: 'snooker', label: 'Snooker / Billiards', emoji: '🎱', color: '#5d6d7e' },
    { value: 'surfing', label: 'Surfing', emoji: '🏄', color: '#3498db' },
    { value: 'swimming', label: 'Swimming', emoji: '🏊', color: '#1abc9c' },
    { value: 'tabletennis', label: 'Table Tennis', emoji: '🏓', color: '#e74c3c' },
    { value: 'tennis', label: 'Tennis', emoji: '🎾', color: '#f39c12' },
    { value: 'volleyball', label: 'Volleyball', emoji: '🏐', color: '#27ae60' },
    { value: 'weightlifting', label: 'Weightlifting', emoji: '🏋️', color: '#8e44ad' },
    { value: 'wrestling', label: 'Wrestling', emoji: '🤼‍♂️', color: '#c0392b' },
    { value: 'horseriding', label: 'Horse Riding (Equestrian)', emoji: '🏇', color: '#d68910' },
    { value: 'shooting', label: 'Shooting', emoji: '🎯', color: '#7f8c8d' },
    { value: 'sailing', label: 'Sailing', emoji: '⛵', color: '#2980b9' },
    { value: 'squash', label: 'Squash', emoji: '🎾', color: '#f1c40f' },
    { value: 'taekwondo', label: 'Taekwondo', emoji: '🥋', color: '#e74c3c' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#ffffff',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch'
    }}>
      {/* Top Navigation */}
      <nav style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#2c3e50'
        }}>
          <button 
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginRight: '1rem',
              display: 'flex',
              alignItems: 'center',
              color: '#667eea'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <span style={{
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Find Coaches
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ 
        padding: '2rem', 
        paddingBottom: '100px', 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        {/* Hero Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem',
          animation: 'fadeInDown 0.8s ease'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#2c3e50',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.05)'
          }}>
            Choose Your Sport
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: '#7f8c8d',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Connect with expert coaches in your favorite sport
          </p>
        </div>

        {/* Sports Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {sportsOptions.map(sport => (
            <div
              key={sport.value}
              onClick={() => navigate(`/coaches/${sport.value}`)}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '2rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                border: '2px solid transparent',
                textAlign: 'center'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.borderColor = sport.color;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <div style={{
                fontSize: '4rem',
                marginBottom: '1rem'
              }}>
                {sport.emoji}
              </div>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: 'bold',
                color: '#2c3e50',
                margin: 0
              }}>
                {sport.label}
              </h3>
            </div>
          ))}
        </div>
      </div>

      <div className="bottom-nav-spacer"></div>
      <BottomNavbar />
    </div>
  );
};

export default Coaches;
