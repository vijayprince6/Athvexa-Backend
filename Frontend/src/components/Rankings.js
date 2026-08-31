import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BottomNavbar from './BottomNavbar';

const Rankings = () => {
  const [rankings, setRankings] = useState([]);
  const [selectedSport, setSelectedSport] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sports options with emojis and colors
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

  const fetchAllRankings = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/rankings/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setRankings(response.data);
    } catch (err) {
      console.error('Rankings API Error:', err);
      if (err.response?.status === 403) {
        setError('Rankings feature is currently unavailable. Please try again later.');
      } else if (err.response?.status === 404) {
        setError('No rankings data available yet. Be the first to share your achievement!');
      } else {
        setError('Failed to load rankings. Please check your connection.');
      }
      // Set empty rankings to prevent infinite loading
      setRankings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSportChange = async (sport) => {
    setSelectedSport(sport);
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/rankings/sport/${sport}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setRankings(response.data);
    } catch (err) {
      setError('Failed to load rankings for selected sport');
    } finally {
      setLoading(false);
    }
  };

  
  
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/login');
      return;
    }
    if (selectedSport) {
      handleSportChange(selectedSport);
    } else {
      fetchAllRankings();
    }
  }, [selectedSport, navigate]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.trim().charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
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
          <img 
            src="/logo.jpeg" 
            alt="Athvexa Logo" 
            style={{
              width: '45px',
              height: '45px',
              marginRight: '1rem',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }} 
          />
          <span style={{
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Athvexa
          </span>
        </div>
        <div style={{
          display: 'flex',
          gap: '1rem'
        }}>
          <button 
            onClick={handleLogout}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(45deg, #e74c3c, #c0392b)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(231, 76, 60, 0.4)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(231, 76, 60, 0.6)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(231, 76, 60, 0.4)';
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ 
        padding: isMobile ? '1rem 0.5rem' : '2rem', 
        paddingBottom: '100px', 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        {/* Hero Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: isMobile ? '1.5rem' : '3rem',
          animation: 'fadeInDown 0.8s ease'
        }}>
          <h1 style={{
            fontSize: isMobile ? '2rem' : '3rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#2c3e50',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.05)'
          }}>
            Sports Rankings
          </h1>
          <p style={{
            fontSize: isMobile ? '1rem' : '1.2rem',
            color: '#7f8c8d',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Discover the top athletes and their achievements across different sports
          </p>
        </div>

        {/* Sport Selection Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: isMobile ? '15px' : '20px',
          padding: isMobile ? '1.25rem' : '2rem',
          marginBottom: '2rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          animation: 'fadeInUp 0.8s ease'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontWeight: 'bold',
              fontSize: '1.8rem',
              color: '#2c3e50',
              textAlign: 'center',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '2rem' }}>Select Your Sport</span>
            </h2>
            <p style={{
              textAlign: 'center',
              color: '#7f8c8d',
              fontSize: '1.1rem',
              marginBottom: '2rem'
            }}>
              Choose a sport to view rankings and achievements
            </p>
          </div>
          
          {/* Sport Dropdown */}
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <label style={{
              display: 'block',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              color: '#333',
              marginBottom: '0.75rem'
            }}>
              Choose Sport
            </label>
            <select
              value={selectedSport}
              onChange={(e) => handleSportChange(e.target.value)}
              style={{
                width: '100%',
                padding: '1.25rem',
                border: '3px solid #e0e0e0',
                borderRadius: '15px',
                fontSize: '1.1rem',
                backgroundColor: 'white',
                outline: 'none',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
              }}
            >
              <option value="">All Sports</option>
              {sportsOptions.map(sport => (
                <option key={sport.value} value={sport.value}>
                  {sport.emoji} {sport.label}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Sport Display */}
          {selectedSport && (
            <div style={{
              textAlign: 'center',
              padding: '1.5rem',
              background: 'linear-gradient(45deg, #e3f2fd, #bbdefb)',
              borderRadius: '15px',
              border: '2px solid #2196f3',
              marginTop: '2rem',
              animation: 'fadeIn 0.5s ease'
            }}>
              <p style={{
                margin: '0',
                color: '#1976d2',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>
                  {sportsOptions.find(s => s.value === selectedSport)?.emoji}
                </span>
                Selected: {sportsOptions.find(s => s.value === selectedSport)?.label}
              </p>
            </div>
          )}
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
            boxShadow: '0 8px 25px rgba(231, 76, 60, 0.3)',
            animation: 'shake 0.5s ease'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>!</div>
            {error}
          </div>
        )}

        {/* Rankings Table */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: isMobile ? '15px' : '25px', 
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          animation: 'fadeInUp 0.8s ease'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: isMobile ? '1.5rem 1rem' : '2rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
              animation: 'shimmer 3s infinite'
            }} />
            <h3 style={{ 
              margin: '0', 
              fontSize: isMobile ? '1.6rem' : '2rem', 
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              zIndex: 1
            }}>
              <span style={{ marginRight: '0.5rem' }}>Leaderboard</span>
            </h3>
            <p style={{ 
              margin: '0.5rem 0 0 0', 
              opacity: 0.95,
              fontSize: isMobile ? '1rem' : '1.2rem',
              position: 'relative',
              zIndex: 1
            }}>
              Top athletes in {selectedSport ? sportsOptions.find(s => s.value === selectedSport)?.label : 'All Sports'}
            </p>
          </div>
          
          {rankings.length === 0 ? (
            <div style={{ 
              padding: '4rem', 
              textAlign: 'center', 
              color: '#666',
              backgroundColor: 'rgba(248, 249, 250, 0.8)'
            }}>
              <div style={{ 
                fontSize: '4rem', 
                marginBottom: '1.5rem',
                animation: 'bounce 2s infinite'
              }}>
                🏆
              </div>
              <h4 style={{ 
                color: '#2c3e50', 
                marginBottom: '0.5rem',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                No Rankings Yet
              </h4>
              <p style={{ 
                color: '#7f8c8d', 
                fontSize: '1.1rem',
                lineHeight: '1.6',
                maxWidth: '400px',
                margin: '0 auto'
              }}>
                Be the first to post achievements and climb the leaderboard! 
              </p>
            </div>
          ) : (
            <div style={{ overflowX: isMobile ? 'hidden' : 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                minWidth: isMobile ? 'auto' : '600px'
              }}>
                <thead>
                  <tr style={{
                    backgroundColor: 'rgba(102, 126, 234, 0.05)',
                    borderBottom: '2px solid #eee'
                  }}>
                    <th style={{ padding: isMobile ? '1rem 0.5rem' : '1.25rem 1rem', color: '#764ba2', fontWeight: '800', fontSize: isMobile ? '0.85rem' : '1rem' }}>S.No</th>
                    <th style={{ padding: isMobile ? '1rem 0.5rem' : '1.25rem 1rem', color: '#764ba2', fontWeight: '800', fontSize: isMobile ? '0.85rem' : '1rem' }}>Name</th>
                    {!isMobile && <th style={{ padding: '1.25rem 1rem', color: '#764ba2', fontWeight: '800' }}>Username</th>}
                    {!isMobile && <th style={{ padding: '1.25rem 1rem', color: '#764ba2', fontWeight: '800' }}>Occupation</th>}
                    <th style={{ padding: isMobile ? '1rem 0.5rem' : '1.25rem 1rem', color: '#764ba2', fontWeight: '800', fontSize: isMobile ? '0.85rem' : '1rem' }}>Sport</th>
                    <th style={{ padding: isMobile ? '1rem 0.5rem' : '1.25rem 1rem', color: '#764ba2', fontWeight: '800', textAlign: 'center', fontSize: isMobile ? '0.85rem' : '1rem' }}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((user, index) => (
                    <tr
                      key={user.id}
                      onClick={() => navigate(`/profile/${user.id}`)}
                      style={{
                        borderBottom: '1px solid #f0f0f0',
                        transition: 'all 0.2s ease',
                        backgroundColor: index < 3 ? 'rgba(255, 215, 0, 0.02)' : 'transparent',
                        cursor: 'pointer'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.05)'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = index < 3 ? 'rgba(255, 215, 0, 0.02)' : 'transparent'}
                    >
                      <td style={{ padding: isMobile ? '0.85rem 0.5rem' : '1.2rem 1rem' }}>
                        <div style={{
                          width: isMobile ? '24px' : '30px',
                          height: isMobile ? '24px' : '30px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#f8f9fa',
                          color: index < 3 ? '#fff' : '#666',
                          fontWeight: 'bold',
                          fontSize: isMobile ? '0.8rem' : '0.9rem'
                        }}>
                          {index + 1}
                        </div>
                      </td>
                      <td style={{ padding: isMobile ? '0.85rem 0.5rem' : '1.2rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.4rem' : '0.75rem' }}>
                          <div style={{
                            width: isMobile ? '28px' : '35px',
                            height: isMobile ? '28px' : '35px',
                            borderRadius: '50%',
                            backgroundColor: '#667eea',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: isMobile ? '0.8rem' : '0.9rem',
                            flexShrink: 0
                          }}>
                            {getInitials(user.name)}
                          </div>
                          <span style={{ fontWeight: '600', color: '#2c3e50', fontSize: isMobile ? '0.85rem' : '1rem' }}>{user.name}</span>
                        </div>
                      </td>
                      {!isMobile && <td style={{ padding: '1.2rem 1rem', color: '#7f8c8d' }}>@{user.username}</td>}
                      {!isMobile && (
                        <td style={{ padding: '1.2rem 1rem' }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            backgroundColor: '#f1f2f6',
                            color: '#57606f'
                          }}>
                            {user.occupation || 'Athlete'}
                          </span>
                        </td>
                      )}
                      <td style={{ padding: isMobile ? '0.85rem 0.5rem' : '1.2rem 1rem' }}>
                        <span style={{
                          padding: isMobile ? '4px 8px' : '4px 12px',
                          borderRadius: '20px',
                          fontSize: isMobile ? '0.75rem' : '0.8rem',
                          fontWeight: '600',
                          backgroundColor: '#e3f2fd',
                          color: '#1976d2',
                          whiteSpace: 'nowrap'
                        }}>
                          {user.sport || 'General'}
                        </span>
                      </td>
                      <td style={{ padding: isMobile ? '0.85rem 0.5rem' : '1.2rem 1rem', textAlign: 'center' }}>
                        <span style={{
                          fontWeight: '800',
                          color: '#27ae60',
                          fontSize: isMobile ? '1rem' : '1.1rem'
                        }}>
                          {user.totalPoints || 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <div className="bottom-nav-spacer"></div>
      <BottomNavbar />
    </div>
  );
};

export default Rankings;
