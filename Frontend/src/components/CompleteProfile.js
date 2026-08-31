import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CompleteProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    dateOfBirth: '',
    gender: '',
    occupation: '',
    occupationName: '',
    bio: '',
    role: 'USER',
    sport: '',
    academyName: '',
    experience: ''
  });

  const sportsOptions = [
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Initialize form with current user data and check if profile is already completed
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      // Check if user has already completed their profile
      if (userData.name && userData.username && userData.dateOfBirth && userData.gender && userData.occupation) {
        // Profile is already completed, redirect to home
        navigate('/home');
        return;
      }
      
      setFormData({
        name: userData.name || '',
        username: userData.username || '',
        dateOfBirth: userData.dateOfBirth || '',
        gender: userData.gender || '',
        occupation: userData.occupation || '',
        occupationName: userData.occupationName || '',
        bio: userData.bio || '',
        // Preserve coach-specific fields so they are not overwritten on re-submit
        role: userData.role || 'USER',
        sport: userData.sport || '',
        academyName: userData.academyName || '',
        experience: userData.experience || ''
      });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: value
      };
      
      // If occupation changes to COACH, set role to COACH
      if (name === 'occupation' && value === 'COACH') {
        updated.role = 'COACH';
      } else if (name === 'occupation' && value !== 'COACH') {
        updated.role = 'USER';
        updated.sport = '';
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      console.log('=== PROFILE FORM SUBMISSION ===');
      console.log('Form data being submitted:', formData);
      console.log('User from localStorage:', user);
      
      const userId = user.userId || user.id;
      const response = await axios.put(
        `/api/users/${userId}`,
        formData
      );
      
      console.log('=== AXIOS RESPONSE ===');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      // Update user data in localStorage
      const updatedUserData = {
        ...user,
        ...response.data.user,
        userId: response.data.user.id ? response.data.user.id.toString() : user.userId
      };
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      // Redirect to home page
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.error || 'Profile update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-brand">Athvexa</div>
        <div className="navbar-actions">
          <button className="nav-item" onClick={() => navigate('/logout')}>
            Logout
          </button>
        </div>
      </nav>

      <div className="profile-container" style={{
        padding: '1rem',
        maxWidth: '600px',
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
            <span className="brand-icon"></span> Complete Your Profile
          </h1>
          <p style={{ margin: '0', opacity: 0.9, fontSize: '1.1rem' }}>
            Let's get to know you better!
          </p>
        </div>
        
        <form onSubmit={handleSubmit} style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block',
              fontWeight: 'bold', 
              fontSize: '1.1rem', 
              color: '#2c3e50',
              marginBottom: '0.5rem'
            }}>
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block',
              fontWeight: 'bold', 
              fontSize: '1.1rem', 
              color: '#2c3e50',
              marginBottom: '0.5rem'
            }}>
              Bio <span style={{ color: '#aaa', fontWeight: 400, fontSize: '0.9rem' }}>(Tell about yourself)</span>
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell about yourself..."
              rows="3"
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease',
                resize: 'vertical'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block',
              fontWeight: 'bold', 
              fontSize: '1.1rem', 
              color: '#2c3e50',
              marginBottom: '0.5rem'
            }}>
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block',
              fontWeight: 'bold', 
              fontSize: '1.1rem', 
              color: '#2c3e50',
              marginBottom: '0.5rem'
            }}>
              Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block',
              fontWeight: 'bold', 
              fontSize: '1.1rem', 
              color: '#2c3e50',
              marginBottom: '0.5rem'
            }}>
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
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
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block',
              fontWeight: 'bold', 
              fontSize: '1.1rem', 
              color: '#2c3e50',
              marginBottom: '0.5rem'
            }}>
              Occupation
            </label>
            <select
              name="occupation"
              value={formData.occupation}
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
              <option value="">Select Occupation</option>
              <option value="SCHOOL">School</option>
              <option value="COLLEGE">College</option>
              <option value="CLUB">Club</option>
              <option value="WORKING">Working</option>
              <option value="COACH">Coach</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block',
              fontWeight: 'bold', 
              fontSize: '1.1rem', 
              color: '#2c3e50',
              marginBottom: '0.5rem'
            }}>
              {formData.occupation === 'SCHOOL' ? 'School Name' :
               formData.occupation === 'COLLEGE' ? 'College Name' :
               formData.occupation === 'CLUB' ? 'Club Name' :
               formData.occupation === 'WORKING' ? 'Company Name' :
               formData.occupation === 'COACH' ? 'Coaching Academy Name' :
               'Occupation Name'}
            </label>
            <input
              type="text"
              name="occupationName"
              value={formData.occupationName}
              onChange={handleChange}
              required
              placeholder={`Enter ${formData.occupation === 'SCHOOL' ? 'school' :
                         formData.occupation === 'COLLEGE' ? 'college' :
                         formData.occupation === 'CLUB' ? 'club' :
                         formData.occupation === 'WORKING' ? 'company' :
                         formData.occupation === 'COACH' ? 'coaching academy' :
                         'occupation'} name`}
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
            />
          </div>
          
          {/* Sports Selection for Coaches */}
          {formData.occupation === 'COACH' && (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block',
                  fontWeight: 'bold', 
                  fontSize: '1.1rem', 
                  color: '#2c3e50',
                  marginBottom: '0.5rem'
                }}>
                  Sport Specialization <span style={{ color: '#e74c3c' }}>*</span>
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
                  <option value="">Select Your Sport</option>
                  {sportsOptions.map(sport => (
                    <option key={sport.value} value={sport.value}>
                      {sport.emoji} {sport.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          
          {error && (
            <div style={{ 
              backgroundColor: '#f8d7da', 
              color: '#721c24', 
              padding: '1rem', 
              borderRadius: '12px', 
              marginBottom: '1.5rem',
              textAlign: 'center',
              border: '1px solid #f5c6cb',
              fontWeight: 'bold'
            }}>
              {error}
            </div>
          )}
          
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
            {loading ? 'Saving Profile...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
