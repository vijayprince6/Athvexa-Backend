import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BottomNavbar from './BottomNavbar';
import PostCard from './PostCard';


const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
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
    fetchPosts();
  }, [navigate]);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));
      const currentUserId = userData ? (userData.userId || userData.id) : null;
      
      const response = await axios.get('/api/posts/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          currentUserId: currentUserId
        }
      });
      setPosts(response.data);
    } catch (err) {
      console.error('Fetch posts error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load posts';
      setError(`Error: ${errorMsg}. Please check your connection.`);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      const currentUserId = user.userId || user.id;
      
      await axios.post('/api/likes/like', null, {
        params: {
          userId: currentUserId,
          postId: postId
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update local state for immediate feedback
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          const isLiked = !post.likedByUser;
          return {
            ...post,
            likedByUser: isLiked,
            likesCount: isLiked ? (post.likesCount || 0) + 1 : Math.max(0, (post.likesCount || 0) - 1)
          };
        }
        return post;
      }));
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleDeletePost = async (postId, postPoints) => {
    try {
      const token = localStorage.getItem('token');
      const currentUserId = user?.userId || user?.id;
      
      await axios.delete(`/api/posts/${postId}`, {
        params: { userId: currentUserId },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove from UI
      setPosts(prev => prev.filter(p => p.id !== postId));
      
      // Update local user points
      if (user) {
        const newPoints = Math.max(0, (user.totalPoints || 0) - (postPoints || 0));
        const updatedUser = { ...user, totalPoints: newPoints };
        setUser(updatedUser);
        
        const localUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
          ...localUser,
          totalPoints: newPoints
        }));
      }
      
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert('Failed to delete post');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading Feed...</p>
      </div>
    );
  }

  return (
    <div className="home-wrapper">
      {/* Top Navigation */}
      <nav className="navbar">
        <div className="navbar-brand">
          <img src="/logo.jpeg" alt="Athvexa Logo" />
          <span className="gradient-text">Athvexa</span>
        </div>
        <div className="navbar-actions">
          <button
            className="nav-btn"
            onClick={() => navigate('/coaches')}
            style={{ 
              background: 'linear-gradient(45deg,#00d2d3,#1abc9c)', 
              color: '#fff', 
              boxShadow: '0 4px 15px rgba(0,210,211,0.3)' 
            }}
          >
            🏅 <span className="desktop-only">Coaches</span>
          </button>
          <button
            className="nav-btn"
            onClick={() => navigate('/rankings')}
            style={{ 
              background: 'linear-gradient(45deg,#FFD700,#FFA500)', 
              color: '#fff', 
              boxShadow: '0 4px 15px rgba(255,215,0,0.3)' 
            }}
          >
            🏆 <span className="desktop-only">Rankings</span>
          </button>
          <button
            className="nav-btn"
            onClick={handleLogout}
            style={{ background: 'linear-gradient(45deg,#e74c3c,#c0392b)', color: '#fff' }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="home-feed">
        {/* Hero Header */}
        <div className="home-hero">
          <h1>Community Feed</h1>
          <p>Real-time achievements from all Athvexa athletes</p>
        </div>



        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}
        
        {posts.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-icon">🏅</div>
            <h3>No Achievements Shared Yet</h3>
            <p>Be the first to inspire the community with your sports success!</p>
            <button className="primary-action-btn" onClick={() => navigate('/post')}>
              Share Achievement
            </button>
          </div>
        ) : (
          <div className="posts-list">
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onLike={handleLike}
                onDelete={handleDeletePost}
                currentUserId={user?.userId || user?.id}
              />
            ))}
          </div>
        )}
      </div>

      <div className="bottom-nav-spacer"></div>
      <BottomNavbar />
    </div>
  );
};

export default Home;
