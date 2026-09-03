import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const navigate = useNavigate();
  const [slowLogin, setSlowLogin] = useState(false);

  // Warm up the backend server as soon as the login page loads.
  // Free-tier servers (Render etc.) sleep after inactivity and take ~30s to wake.
  // Pinging /api/auth/current-user on mount gives them a head-start before the
  // user even types their password, so the actual login feels instant.
  useEffect(() => {
    axios.get('/api/health').catch(() => {
      // Ignore errors — we only care about waking the server, not the response
    });
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSlowLogin(false);
    setError('');
    setErrorCode('');

    // If login takes > 5s, show a friendly cold-start message
    const slowTimer = setTimeout(() => setSlowLogin(true), 5000);

    try {
      const response = await axios.post('/api/auth/login', formData);

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      // Check if profile is complete
      const user = response.data;
      if (!user.name || !user.fullName || !user.dateOfBirth || !user.gender || !user.occupation) {
        navigate('/complete-profile');
      } else {
        navigate('/home');
      }
    } catch (err) {
      const data = err.response?.data;
      console.log('Login error:', data);
      setErrorCode(data?.errorCode || '');
      setError(data?.error || 'Login failed. Please try again.');
    } finally {
      clearTimeout(slowTimer);
      setLoading(false);
      setSlowLogin(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative'
    }}>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '2rem 1.5rem',
        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.2)',
        width: '100%',
        maxWidth: '380px',
        textAlign: 'center'
      }}>
        {/* Title */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <img
              src="/logo.jpeg"
              alt="Athvexa Logo"
              style={{
                width: '45px',
                height: '45px',
                marginRight: '0.75rem',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            />
            <h1 style={{
              margin: '0',
              fontSize: '1.8rem',
              fontWeight: 'bold',
              color: '#2c3e50'
            }}>
              Athvexa
            </h1>
          </div>
          <p style={{
            margin: '0',
            color: '#7f8c8d',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            Unlock Your Sports Potential
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label
              htmlFor="login-email"
              style={{
              display: 'block',
              fontWeight: 'bold',
              fontSize: '1rem',
              color: '#2c3e50',
              marginBottom: '0.5rem'
            }}>
              Email
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="login-password"
              style={{
              display: 'block',
              fontWeight: 'bold',
              fontSize: '1rem',
              color: '#2c3e50',
              marginBottom: '0.5rem'
            }}>
              Password
            </label>
            <input
              id="login-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              textAlign: 'center',
              border: '1px solid #f5c6cb',
              fontWeight: 'bold',
              fontSize: '0.92rem'
            }}>
              {error}
              {/* If user not found, show a Register link inside the error */}
              {errorCode === 'USER_NOT_FOUND' && (
                <div style={{ marginTop: '0.5rem', fontWeight: 'normal' }}>
                  <a
                    href="/register"
                    style={{ color: '#721c24', fontWeight: 'bold', textDecoration: 'underline' }}
                  >
                    Register for an account
                  </a>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1.25rem',
              backgroundColor: loading ? '#95a5a6' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
              marginBottom: '1.5rem'
            }}
          >
            {loading ? (slowLogin ? 'Waking server up...' : 'Logging in...') : 'Login'}
          </button>
        </form>

        <div style={{
          color: '#7f8c8d',
          fontSize: '1rem'
        }}>
          Don't have an account?
          <a
            href="/register"
            style={{
              color: '#2563eb',
              textDecoration: 'none',
              fontWeight: 'bold',
              marginLeft: '0.5rem'
            }}
          >
            Register
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
