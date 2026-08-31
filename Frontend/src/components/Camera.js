import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BottomNavbar from './BottomNavbar';

const Camera = () => {
  const [formData, setFormData] = useState({
    description: '',
    sport: '',
    achievementLevel: '',
    position: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const sports = [
    { value: 'archery', label: 'Archery', emoji: '🏹' },
    { value: 'athletics', label: 'Athletics (Running)', emoji: '🏃' },
    { value: 'badminton', label: 'Badminton', emoji: '🏸' },
    { value: 'baseball', label: 'Baseball', emoji: '⚾' },
    { value: 'basketball', label: 'Basketball', emoji: '🏀' },
    { value: 'boxing', label: 'Boxing', emoji: '🥊' },
    { value: 'carrom', label: 'Carrom', emoji: '🎯' },
    { value: 'chess', label: 'Chess', emoji: '♟️' },
    { value: 'cricket', label: 'Cricket', emoji: '🏏' },
    { value: 'cycling', label: 'Cycling', emoji: '🚴' },
    { value: 'fencing', label: 'Fencing', emoji: '🤺' },
    { value: 'football', label: 'Football (Soccer)', emoji: '⚽' },
    { value: 'golf', label: 'Golf', emoji: '⛳' },
    { value: 'gymnastics', label: 'Gymnastics', emoji: '🤸' },
    { value: 'handball', label: 'Handball', emoji: '🤾' },
    { value: 'hockey', label: 'Hockey (Field Hockey)', emoji: '🏑' },
    { value: 'icehockey', label: 'Ice Hockey', emoji: '🏒' },
    { value: 'judo', label: 'Judo', emoji: '🤼‍♂️' },
    { value: 'kabaddi', label: 'Kabaddi', emoji: '🤼' },
    { value: 'karate', label: 'Karate', emoji: '🥋' },
    { value: 'rugby', label: 'Rugby', emoji: '🏉' },
    { value: 'skating', label: 'Skating', emoji: '⛸️' },
    { value: 'snooker', label: 'Snooker / Billiards', emoji: '🎱' },
    { value: 'surfing', label: 'Surfing', emoji: '🏄' },
    { value: 'swimming', label: 'Swimming', emoji: '🏊' },
    { value: 'tabletennis', label: 'Table Tennis', emoji: '🏓' },
    { value: 'tennis', label: 'Tennis', emoji: '🎾' },
    { value: 'volleyball', label: 'Volleyball', emoji: '🏐' },
    { value: 'weightlifting', label: 'Weightlifting', emoji: '🏋️' },
    { value: 'wrestling', label: 'Wrestling', emoji: '🤼‍♂️' },
    { value: 'horseriding', label: 'Horse Riding (Equestrian)', emoji: '🏇' },
    { value: 'shooting', label: 'Shooting', emoji: '🎯' },
    { value: 'sailing', label: 'Sailing', emoji: '⛵' },
    { value: 'squash', label: 'Squash', emoji: '🎾' },
    { value: 'taekwondo', label: 'Taekwondo', emoji: '🥋' }
  ];

  const achievementLevels = [
    { name: 'Local Level (School / Village / Club)', points: 30 },
    { name: 'District Level', points: 60 },
    { name: 'State Level', points: 120 },
    { name: 'National Level', points: 300 },
    { name: 'International Level', points: 500 },
    { name: 'Olympics Level', points: 1000 }
  ];

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Create a preview URL so the user can see the selected photo
      if (imagePreview) URL.revokeObjectURL(imagePreview); // free old
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const calculatePoints = (level, position) => {
    const levelData = achievementLevels.find(l => l.name === level);
    if (!levelData) return 0;
    
    const basePoints = levelData.points;
    switch (position) {
      case '1': return basePoints; // 1st place
      case '2': return Math.round(basePoints * 0.67); // 2nd place
      case '3': return Math.round(basePoints * 0.42); // 3rd place
      default: return Math.round(basePoints * 0.17); // Participation
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('userId', user.userId);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('sport', formData.sport);
      formDataToSend.append('achievementLevel', formData.achievementLevel);
      formDataToSend.append('position', formData.position);
      
      if (image) {
        formDataToSend.append('image', image);
      }

      const token = localStorage.getItem('token');
      await axios.post('/api/posts/create', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      alert('Post created successfully!');
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', paddingBottom: 20 }}>

      {/* ── Header bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 22, lineHeight: 1 }}>←</button>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>Share Achievement</span>
      </div>

      {/* ── Scrollable form card ── */}
      <div style={{ padding: '16px 16px 0', maxWidth: 520, margin: '0 auto' }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: '24px 20px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Describe your achievement *</label>
              <textarea
                name="description"
                className="form-input"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Tell us about your achievement..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Select Sport *</label>
              <select
                name="sport"
                className="form-input"
                value={formData.sport}
                onChange={handleChange}
                required
              >
                <option value="">Select a sport</option>
                {sports.map((sport) => (
                  <option key={sport.value} value={sport.value}>{sport.emoji} {sport.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Achievement Level *</label>
              <select
                name="achievementLevel"
                className="form-input"
                value={formData.achievementLevel}
                onChange={handleChange}
                required
              >
                <option value="">Select achievement level</option>
                {achievementLevels.map((level) => (
                  <option key={level.name} value={level.name}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Position *</label>
              <select
                name="position"
                className="form-input"
                value={formData.position}
                onChange={handleChange}
                required
              >
                <option value="">Select position</option>
                <option value="1">1st Place</option>
                <option value="2">2nd Place</option>
                <option value="3">3rd Place</option>
                <option value="4">Participation</option>
              </select>
            </div>

            {/* ── Live Points Preview ── */}
            {formData.achievementLevel && formData.position && (() => {
              const pts = calculatePoints(formData.achievementLevel, formData.position);
              const posLabel = { '1': '🥇 1st Place', '2': '🥈 2nd Place', '3': '🥉 3rd Place', '4': '🎖️ Participation' }[formData.position];
              return (
                <div style={{
                  background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
                  border: '2px solid #22c55e',
                  borderRadius: 14,
                  padding: '14px 18px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginBottom: 4 }}>
                    🏆 Points you'll earn · {posLabel}
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: '#15803d', lineHeight: 1.1 }}>
                    +{pts} pts
                  </div>
                  <div style={{ fontSize: 11, color: '#86efac', marginTop: 4 }}>
                    Will be added to your total ranking
                  </div>
                </div>
              );
            })()}

            <div className="form-group">
              <label className="form-label">Select Photo *</label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="form-input"
                required
              />
              {/* ── Photo Preview ── */}
              {imagePreview && (
                <div style={{ marginTop: 10, position: 'relative' }}>
                  <img
                    src={imagePreview}
                    alt="Selected preview"
                    style={{
                      width: '100%',
                      maxHeight: 260,
                      objectFit: 'cover',
                      borderRadius: 12,
                      border: '2px solid #667eea',
                      display: 'block',
                    }}
                  />
                  {/* ✓ badge */}
                  <div style={{
                    position: 'absolute', top: 8, right: 8,
                    background: '#22c55e', color: '#fff',
                    borderRadius: 20, padding: '2px 10px',
                    fontSize: 12, fontWeight: 700,
                  }}>
                    ✓ Photo selected
                  </div>
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => { setImage(null); setImagePreview(null); }}
                    style={{
                      position: 'absolute', top: 8, left: 8,
                      background: 'rgba(0,0,0,0.55)', color: '#fff',
                      border: 'none', borderRadius: 20, padding: '2px 10px',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    ✕ Remove
                  </button>
                </div>
              )}
            </div>

            {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Creating Post...' : 'Share Achievement'}
            </button>
          </form>
        </div>
      </div>

      <div className="bottom-nav-spacer"></div>
      <BottomNavbar />
    </div>
  );
};

export default Camera;
