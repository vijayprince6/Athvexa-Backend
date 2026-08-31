import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setErrorCode('');
    setSuccessMsg('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/auth/register', {
        email: formData.email,
        password: formData.password
      });

      // AUTO-LOGIN: Store user data in localStorage immediately
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      // Note: If the backend provides a token upon registration, store it too.
      if (userData.token) {
        localStorage.setItem('token', userData.token);
      }

      setSuccessMsg('Account created successfully! Logging you in...');
      
      // Redirect to complete-profile or home
      setTimeout(() => {
        if (!userData.name || !userData.fullName || !userData.dateOfBirth || !userData.gender || !userData.occupation) {
          navigate('/complete-profile');
        } else {
          navigate('/home');
        }
      }, 1500);

    } catch (err) {
      const data = err.response?.data;
      console.log('Register error:', data);
      setErrorCode(data?.errorCode || '');
      setError(data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
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
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
          <img
            src="/logo.jpeg"
            alt="Athvexa Logo"
            style={{
              width: '50px',
              height: '50px',
              marginRight: '1rem',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          />
          <h1 style={{
            margin: 0,
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: '#2c3e50'
          }}>
            Join Athvexa
          </h1>
        </div>

        <form style={{ textAlign: 'left' }} onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: '1rem' }}>
            <label
              htmlFor="register-email"
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
              id="register-email"
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
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1rem' }}>
            <label
              htmlFor="register-password"
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
              id="register-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              placeholder="Create a password"
              minLength="6"
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="register-confirm-password"
              style={{
              display: 'block',
              fontWeight: 'bold',
              fontSize: '1rem',
              color: '#2c3e50',
              marginBottom: '0.5rem'
            }}>
              Confirm Password
            </label>
            <input
              id="register-confirm-password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              placeholder="Confirm your password"
              minLength="6"
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '1rem',
              textAlign: 'center',
              border: '1px solid #f5c6cb',
              fontWeight: 'bold',
              fontSize: '0.92rem'
            }}>
              {error}
              {/* If account already exists, show Login link */}
              {errorCode === 'EMAIL_EXISTS' && (
                <div style={{ marginTop: '0.5rem', fontWeight: 'normal' }}>
                  👉{' '}
                  <a
                    href="/login"
                    style={{ color: '#721c24', fontWeight: 'bold', textDecoration: 'underline' }}
                  >
                    Click here to Login
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Success message */}
          {successMsg && (
            <div style={{
              backgroundColor: '#d4edda',
              color: '#155724',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '1rem',
              textAlign: 'center',
              border: '1px solid #c3e6cb',
              fontWeight: 'bold',
              fontSize: '0.92rem'
            }}>
              ✅ {successMsg}
              <div style={{ fontWeight: 'normal', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Redirecting to login...
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !!successMsg}
            style={{
              width: '100%',
              padding: '1.25rem',
              backgroundColor: loading || successMsg ? '#95a5a6' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: loading || successMsg ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
              marginBottom: '1.5rem'
            }}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ color: '#7f8c8d', fontSize: '1rem' }}>
          Already have an account?{' '}
          <a
            href="/login"
            style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}
          >
            Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;
