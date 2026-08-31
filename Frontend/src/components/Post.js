import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BottomNavbar from './BottomNavbar';

const Post = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    description: '',
    sport: '',
    achievementLevel: '',
    position: '',
    image: null
  });

  
  // Sports options with emojis
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

  
  // Achievement levels
  const achievementLevels = [
    { value: 'district', label: 'District Level' },
    { value: 'state', label: 'State Level' },
    { value: 'national', label: 'National Level' },
    { value: 'international', label: 'International Level' },
    { value: 'school', label: 'School Level' },
    { value: 'college', label: 'College Level' },
    { value: 'university', label: 'University Level' },
    { value: 'club', label: 'Club Level' }
  ];

  // Position options
  const positions = [
    { value: '1', label: '1st Position' },
    { value: '2', label: '2nd Position' },
    { value: '3', label: '3rd Position' },
    { value: 'participate', label: 'Participated' }
  ];

  // Calculate points based on achievement level and position


  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files && files[0]) {
      // Handle file input
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      // Handle text inputs
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate all required fields
    if (!formData.description.trim()) {
      setError('Please describe your achievement');
      setLoading(false);
      return;
    }

    if (!formData.sport) {
      setError('Please select a sport');
      setLoading(false);
      return;
    }

    if (!formData.achievementLevel) {
      setError('Please select an achievement level');
      setLoading(false);
      return;
    }

    if (!formData.position) {
      setError('Please select your position');
      setLoading(false);
      return;
    }

    if (!formData.image) {
      setError('Please upload a photo of your achievement');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Direct post creation
      const formDataToSend = new FormData();
      formDataToSend.append('description', formData.description);
      formDataToSend.append('sport', formData.sport);
      formDataToSend.append('achievementLevel', formData.achievementLevel);
      formDataToSend.append('position', formData.position);
      formDataToSend.append('userId', user.userId);
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      
      await axios.post(
        '/api/posts/create',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setSuccess('🎉 Achievement posted successfully!');
      setFormData({
        description: '',
        sport: '',
        achievementLevel: '',
        position: '',
        image: null
      });

      // Redirect to home after successful post
      setTimeout(() => {
        navigate('/home');
      }, 2000);

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to create post. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  
  if (!user) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div>
      {/* Top Navigation */}
      <nav className="navbar">
        <div className="navbar-brand">
          <img 
            src="/logo.jpeg" 
            alt="Athvexa Logo" 
            style={{
              width: '40px',
              height: '40px',
              marginRight: '0.5rem',
              borderRadius: '6px'
            }} 
          />
          Create Post
        </div>
        <div className="navbar-actions">
          <button className="nav-item" onClick={() => navigate('/home')}>
            <span className="nav-icon">Cancel</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="post-container" style={{ 
        padding: '1rem', 
        maxWidth: '700px', 
        margin: '0 auto',
        backgroundColor: '#f8f9fa',
        minHeight: 'calc(100vh - 120px)'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem',
          padding: '2rem 1rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          color: 'white',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)'
        }}>
          <h1 style={{ 
            margin: '0',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem'
          }}>
            Share Your Achievement
          </h1>
          <p style={{ margin: '0', opacity: 0.9, fontSize: '1.1rem' }}>
            Inspire others with your sports accomplishments
          </p>
        </div>

        
        {/* Success Message */}
        {success && (
          <div style={{ 
            backgroundColor: '#d4edda', 
            color: '#155724', 
            padding: '1.5rem', 
            borderRadius: '15px', 
            marginBottom: '1.5rem',
            border: '1px solid #c3e6cb',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{ 
            backgroundColor: '#f8d7da', 
            color: '#721c24', 
            padding: '1.5rem', 
            borderRadius: '15px', 
            marginBottom: '1.5rem',
            border: '1px solid #f5c6cb',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            {error}
          </div>
        )}

        {/* Post Form */}
        <form onSubmit={handleSubmit} style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)'
        }}>
          {/* Achievement Description */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block',
              fontWeight: 'bold', 
              fontSize: '1.1rem', 
              color: '#2c3e50',
              marginBottom: '0.5rem'
            }}>
              Describe your achievement *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Tell us about your amazing achievement... What did you accomplish? How did it feel?"
              rows="5"
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '1rem',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
            />
          </div>

          {/* Sport Selection */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block',
              fontWeight: 'bold', 
              fontSize: '1.1rem', 
              color: '#2c3e50',
              marginBottom: '0.5rem'
            }}>
              Select Sport *
            </label>
            <select
              name="sport"
              value={formData.sport}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '1rem',
                backgroundColor: 'white',
                outline: 'none',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
            >
              <option value="">Choose your sport...</option>
              {sports.map(sport => (
                <option key={sport.value} value={sport.value}>
                  {sport.emoji} {sport.label}
                </option>
              ))}
            </select>
          </div>

          {/* Achievement Level */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block',
              fontWeight: 'bold', 
              fontSize: '1.1rem', 
              color: '#2c3e50',
              marginBottom: '0.5rem'
            }}>
              Achievement Level *
            </label>
            <select
              name="achievementLevel"
              value={formData.achievementLevel}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '1rem',
                backgroundColor: 'white',
                outline: 'none',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
            >
              <option value="">Select achievement level...</option>
              {achievementLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* Position */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block',
              fontWeight: 'bold', 
              fontSize: '1.1rem', 
              color: '#2c3e50',
              marginBottom: '0.5rem'
            }}>
              Position *
            </label>
            <select
              name="position"
              value={formData.position}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '1rem',
                backgroundColor: 'white',
                outline: 'none',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
            >
              <option value="">Select your position...</option>
              {positions.map(position => (
                <option key={position.value} value={position.value}>
                  {position.label}
                </option>
              ))}
            </select>
          </div>

          {/* Photo Upload */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block',
              fontWeight: 'bold', 
              fontSize: '1.1rem', 
              color: '#2c3e50',
              marginBottom: '0.5rem'
            }}>
              Select Photo *
            </label>
            <div style={{
              border: '2px dashed #e0e0e0',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center',
              backgroundColor: '#f8f9fa',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => {
              // Create file input for camera/gallery selection
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.capture = 'environment'; // For camera
              input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                  handleChange({ target: { name: 'image', files: [file] } });
                }
              };
              input.click();
            }}
            >
              <label style={{ 
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: '#667eea',
                transition: 'all 0.3s ease'
              }}>
                Select Photo
              </label>
              <div style={{ marginTop: '1rem', color: '#7f8c8d', fontSize: '0.9rem' }}>
                {formData.image ? `Selected: ${formData.image.name}` : 'Click to select photo from gallery or take a new photo'}
              </div>
              {formData.image && (
                <div style={{ marginTop: '1rem' }}>
                  <img 
                    src={URL.createObjectURL(formData.image)} 
                    alt="Selected" 
                    style={{
                      width: '100%',
                      maxHeight: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '2px solid #e0e0e0'
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1.25rem',
              backgroundColor: loading ? '#95a5a6' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}
          >
            {loading ? 'Posting Achievement...' : 'Share Achievement'}
          </button>
        </form>
      </div>
      <BottomNavbar />
    </div>
  );
};

export default Post;

