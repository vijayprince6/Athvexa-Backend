import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import BottomNavbar from './BottomNavbar';

const SportCoaches = () => {
  const { sport } = useParams();
  const navigate = useNavigate();
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) || {}; }
    catch { return {}; }
  });

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

  const currentSport = sportsOptions.find(s => s.value === sport);

  const fetchCoaches = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/users/coaches/${sport}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCoaches(response.data);
    } catch (err) {
      console.error('Error fetching coaches:', err);
      setError('Failed to load coaches. Please try again.');
      setCoaches([]);
    } finally {
      setLoading(false);
    }
  }, [sport]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/login');
      return;
    }
    fetchCoaches();
  }, [sport, navigate, fetchCoaches]);

  const getInitials = (name) => {
    if (!name) return 'C';
    return name.trim().charAt(0).toUpperCase();
  };

  const handleViewProfile = (coachId) => {
    navigate(`/profile/${coachId}`);
  };

  const handleChat = (coach) => {
    navigate('/chat', {
      state: {
        selectedUser: {
          id: coach.id,
          username: coach.username,
          name: coach.name || coach.fullName || coach.username
        }
      }
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', minHeight: '100vh' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
        <p>Loading coaches...</p>
      </div>
    );
  }

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
            onClick={() => navigate('/coaches')}
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
            {currentSport?.emoji} {currentSport?.label} Coaches
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
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>
            {currentSport?.emoji}
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#2c3e50',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.05)'
          }}>
            {currentSport?.label} Coaches
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: '#7f8c8d',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Connect with expert {currentSport?.label.toLowerCase()} coaches
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
            color: 'white',
            padding: '1.5rem',
            borderRadius: '15px',
            marginBottom: '2rem',
            textAlign: 'center',
            boxShadow: '0 8px 25px rgba(231, 76, 60, 0.3)'
          }}>
            {error}
          </div>
        )}

        {/* Coaches List */}
        {coaches.length === 0 ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '25px',
            padding: '4rem 2rem',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>
              🔍
            </div>
            <h3 style={{
              color: '#2c3e50',
              marginBottom: '0.5rem',
              fontSize: '1.8rem',
              fontWeight: 'bold'
            }}>
              No Coaches Found
            </h3>
            <p style={{
              color: '#7f8c8d',
              fontSize: '1.1rem',
              lineHeight: '1.6',
              maxWidth: '400px',
              margin: '0 auto'
            }}>
              No coaches available for {currentSport?.label} yet. Check back soon!
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {coaches.map(coach => (
              <div
                key={coach.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  padding: '2rem',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  border: '2px solid transparent'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.borderColor = currentSport?.color;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                {/* Coach Avatar */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: coach.profileImageUrl || coach.avatarUrl
                      ? `url(${coach.profileImageUrl || coach.avatarUrl})`
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                  }}>
                    {!coach.profileImageUrl && !coach.avatarUrl && getInitials(coach.name)}
                  </div>

                  {/* Coach Badge */}
                  <div style={{
                    background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                    color: '#fff',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)'
                  }}>
                    🏅 Coach
                  </div>
                </div>

                {/* Coach Info */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{
                    fontSize: '1.4rem',
                    fontWeight: 'bold',
                    color: '#2c3e50',
                    margin: '0 0 0.5rem 0'
                  }}>
                    {coach.name || coach.fullName || coach.username}
                  </h3>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#7f8c8d',
                    margin: '0 0 0.75rem 0'
                  }}>
                    @{coach.username}
                  </p>

                  {/* Sport Badge */}
                  <div style={{
                    display: 'inline-block',
                    background: `${currentSport?.color}15`,
                    color: currentSport?.color,
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '0.75rem'
                  }}>
                    {currentSport?.emoji} {currentSport?.label}
                  </div>

                  {/* Academy Name */}
                  {coach.academyName && (
                    <p style={{
                      fontSize: '0.95rem',
                      color: '#555',
                      margin: '0.5rem 0',
                      fontWeight: '500'
                    }}>
                      🏫 {coach.academyName}
                    </p>
                  )}

                  {/* Experience */}
                  {coach.experience && (
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#666',
                      margin: '0.5rem 0'
                    }}>
                      📅 {coach.experience} years experience
                    </p>
                  )}

                  {/* Points */}
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#27ae60',
                    fontWeight: 'bold',
                    margin: '0.5rem 0'
                  }}>
                    ⭐ {coach.totalPoints || 0} Points
                  </p>
                </div>

                {/* Action Buttons */}
                {(() => {
                  const isMe = String(coach.id) === String(currentUser.userId || currentUser.id);
                  return (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        onClick={() => handleViewProfile(coach.id)}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          background: 'linear-gradient(45deg, #667eea, #764ba2)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                        }}
                      >
                        View Profile
                      </button>

                      {isMe ? (
                        <div style={{
                          flex: 1,
                          padding: '0.75rem',
                          background: 'linear-gradient(45deg, #bdc3c7, #95a5a6)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          textAlign: 'center',
                          userSelect: 'none'
                        }}>
                          👤 You
                        </div>
                      ) : (
                        <button
                          onClick={() => handleChat(coach)}
                          style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: 'linear-gradient(45deg, #00d2d3, #1abc9c)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px rgba(0, 210, 211, 0.3)'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 20px rgba(0, 210, 211, 0.4)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px rgba(0, 210, 211, 0.3)';
                          }}
                        >
                          💬 Chat
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bottom-nav-spacer"></div>
      <BottomNavbar />
    </div>
  );
};

export default SportCoaches;
