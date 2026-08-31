import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const BottomNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [initial, setInitial] = useState('U');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      const name = userData.name || userData.username || 'User';
      setInitial(name.trim().charAt(0).toUpperCase());
    }
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData) return;
      
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/chat/unread/count', {
        params: { userId: userData.userId || userData.id },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUnreadCount(response.data || 0);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      path: '/home',
      icon: <span style={{ fontSize: '1.4rem' }}>🏠</span>
    },
    {
      id: 'chat',
      label: 'Chat',
      path: '/chat',
      icon: (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{ fontSize: '1.4rem' }}>💬</span>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-6px',
              right: '-8px',
              backgroundColor: '#ef4444',
              color: 'white',
              fontSize: '0.65rem',
              fontWeight: 'bold',
              minWidth: '18px',
              height: '18px',
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      )
    },
    {
      id: 'post',
      label: 'Post',
      path: '/camera',
      isCenter: true,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      )
    },
    {
      id: 'profile',
      label: 'Profile',
      path: '/profile',
      icon: (
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6e8efb 0%, #a777e3 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {initial}
        </div>
      )
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      backgroundColor: 'white',
      borderTop: '1px solid #f0f0f0',
      padding: '0.4rem 0',
      zIndex: 1000,
      boxShadow: '0 -4px 15px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        maxWidth: '500px',
        margin: '0 auto',
        padding: '0 1rem'
      }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          if (item.isCenter) {
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                style={{
                  background: 'linear-gradient(135deg, #6e8efb 0%, #a777e3 100%)',
                  border: 'none',
                  borderRadius: '16px',
                  width: '56px',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(110, 142, 251, 0.4)',
                  transition: 'transform 0.2s ease',
                  margin: '0 10px'
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {item.icon}
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              style={{
                background: 'none',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                color: isActive ? '#6e8efb' : '#94a3b8',
                transition: 'all 0.2s ease',
                gap: '2px',
                padding: '4px 8px',
                minWidth: '60px'
              }}
            >
              <div style={{ 
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {item.icon}
              </div>
              <span style={{ 
                fontSize: '0.7rem', 
                fontWeight: isActive ? '700' : '500'
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavbar;

