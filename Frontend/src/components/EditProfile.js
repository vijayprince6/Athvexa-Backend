import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BottomNavbar from './BottomNavbar';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    dateOfBirth: '',
    gender: '',
    occupation: '',
    occupationName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);
    const userId = userData.userId || userData.id;
    if (userId) {
      fetchUserProfile(userId);
    }
  }, [navigate]);

  const fetchUserProfile = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setFormData({
        name: response.data.name || '',
        username: response.data.username || '',
        bio: response.data.bio || '',
        dateOfBirth: response.data.dateOfBirth || '',
        gender: response.data.gender || '',
        occupation: response.data.occupation || '',
        occupationName: response.data.occupationName || ''
      });
    } catch (err) {
      setError('Failed to load profile');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const userId = user.userId || user.id;
      const response = await axios.put(
        `/api/users/${userId}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Update user data in localStorage - ensure we keep userId key for consistency
      const updatedUser = {
        ...user,
        ...response.data.user,
        userId: response.data.user.id ? response.data.user.id.toString() : user.userId
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      alert('Your changes have been saved');
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error || 'Profile update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #f0f0f0', backgroundColor: '#fff', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#111', padding: 4, display: 'flex', alignItems: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>Edit Profile</span>
        </div>
        <div style={{ width: 32 }}></div> {/* Spacer to balance the header */}
      </div>

      {/* Edit Profile Content */}
      <div style={{ padding: '20px 16px 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: '#555' }}>Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: '#555' }}>
                Bio <span style={{ color: '#aaa', fontWeight: 400 }}>(write anything about yourself)</span>
              </label>
              <textarea
                name="bio"
                className="form-input"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell about yourself..."
                rows="3"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: '#555' }}>Username</label>
              <input
                type="text"
                name="username"
                className="form-input"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Choose a username"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: '#555' }}>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                className="form-input"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: '#555' }}>Gender</label>
              <select
                name="gender"
                className="form-input"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: '#555' }}>Occupation</label>
              <select
                name="occupation"
                className="form-input"
                value={formData.occupation}
                onChange={handleChange}
                required
              >
                <option value="">Select Occupation</option>
                <option value="SCHOOL">School</option>
                <option value="COLLEGE">College</option>
                <option value="CLUB">Club</option>
                <option value="WORKING">Working</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: '#555' }}>
                {formData.occupation === 'SCHOOL' ? 'School Name' :
                 formData.occupation === 'COLLEGE' ? 'College Name' :
                 formData.occupation === 'CLUB' ? 'Club Name' :
                 formData.occupation === 'WORKING' ? 'Company Name' :
                 'Occupation Name'}
              </label>
              <input
                type="text"
                name="occupationName"
                className="form-input"
                value={formData.occupationName}
                onChange={handleChange}
                required
                placeholder="Enter name"
              />
            </div>

            {error && <div style={{ color: '#e74c3c', textAlign: 'center', fontSize: 14 }}>{error}</div>}
            
            <button 
              type="submit" 
              className="auth-button" 
              disabled={loading}
              style={{ marginTop: 10, padding: '12px', borderRadius: 12, fontWeight: 700 }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>

      <div className="bottom-nav-spacer"></div>
      <BottomNavbar />
    </div>
  );
};

export default EditProfile;
