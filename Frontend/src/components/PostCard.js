import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PostCard = ({ post, onLike, onDelete, currentUserId }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showLikersModal, setShowLikersModal] = useState(false);
  const [likers, setLikers] = useState([]);
  const [loadingLikers, setLoadingLikers] = useState(false);
  const isVideo = post.imageUrl?.match(/\.(mp4|mov|webm)$/i) || post.imageUrl?.includes('video/upload');
  const user = post.user;
  const isOwner = currentUserId && user?.id && currentUserId.toString() === user.id.toString();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.trim().charAt(0).toUpperCase();
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this post? This will also reduce your points.")) {
      if (onDelete) onDelete(post.id, post.points);
      setShowMenu(false);
    }
  };

  const handleShowLikers = async (e) => {
    e.stopPropagation();
    setShowLikersModal(true);
    setLoadingLikers(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/likes/post/${post.id}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setLikers(response.data);
    } catch (err) {
      console.error('Failed to fetch likers:', err);
      setLikers([]);
    } finally {
      setLoadingLikers(false);
    }
  };

  return (
    <div className="premium-post-card">
      {/* Header */}
      <div className="pc-header" onClick={() => navigate(`/profile/${user?.id}`)}>
        <div className="pc-avatar-wrapper">
          {user?.profileImageUrl ? (
            <img src={user.profileImageUrl} alt="avatar" className="pc-avatar-img" />
          ) : (
            <div className="pc-avatar-initial">{getInitials(user?.name)}</div>
          )}
        </div>
        <div className="pc-user-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="pc-username">{user?.username || user?.name || 'User'}</span>
            {user?.role === 'COACH' && user?.sport && (
              <>
                <span style={{ color: '#8e8e8e' }}>•</span>
                <span style={{
                  background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: 'bold',
                  fontSize: '0.85rem'
                }}>
                  {(() => {
                    const sportEmojis = {
                      archery: '🏹', athletics: '🏃', badminton: '🏸', baseball: '⚾',
                      basketball: '🏀', boxing: '🥊', carrom: '🎯', chess: '♟️',
                      cricket: '🏏', cycling: '🚴', fencing: '🤺', football: '⚽',
                      golf: '⛳', gymnastics: '🤸', handball: '🤾', hockey: '🏑',
                      icehockey: '🏒', judo: '🤼‍♂️', kabaddi: '🤼', karate: '🥋',
                      rugby: '🏉', skating: '⛸️', snooker: '🎱', surfing: '🏄',
                      swimming: '🏊', tabletennis: '🏓', tennis: '🎾', volleyball: '🏐',
                      weightlifting: '🏋️', wrestling: '🤼‍♂️', horseriding: '🏇',
                      shooting: '🎯', sailing: '⛵', squash: '🎾', taekwondo: '🥋'
                    };
                    return sportEmojis[user.sport] || '🏅';
                  })()}
                  {' '}
                  {user.sport.charAt(0).toUpperCase() + user.sport.slice(1).replace(/([A-Z])/g, ' $1')} Coach
                </span>
              </>
            )}
          </div>
          <span className="pc-sport-tag">{post.sport || 'General'}</span>
        </div>
        <div className="pc-more-options" style={{ position: 'relative' }}>
          {isOwner && (
            <svg 
              width="20" height="20" viewBox="0 0 24 24" fill="currentColor" 
              style={{ cursor: 'pointer' }}
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            >
              <circle cx="12" cy="12" r="1.5" /><circle cx="6" cy="12" r="1.5" /><circle cx="18" cy="12" r="1.5" />
            </svg>
          )}
          {showMenu && isOwner && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              backgroundColor: '#fff',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              borderRadius: '8px',
              zIndex: 100,
              minWidth: '120px',
              overflow: 'hidden'
            }}>
              <button 
                onClick={handleDeleteClick}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: 'none',
                  background: 'none',
                  color: '#ed4956',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                Delete Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Image/Video */}
      <div className="pc-media-container" onDoubleClick={() => onLike(post.id)}>
        {isVideo ? (
          <video 
            src={post.imageUrl} 
            className="pc-media" 
            controls 
            loop 
            playsInline 
            autoPlay 
            muted 
          />
        ) : (
          <img src={post.imageUrl} alt="post" className="pc-media" loading="lazy" />
        )}
      </div>

      {/* Actions */}
      <div className="pc-actions">
        <button className="pc-action-btn" onClick={() => onLike(post.id)}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill={post.likedByUser ? "#ed4956" : "none"} stroke={post.likedByUser ? "#ed4956" : "#262626"} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        <span 
          className="pc-likes-count" 
          onClick={handleShowLikers}
          style={{ cursor: post.likesCount > 0 ? 'pointer' : 'default', color: post.likesCount > 0 ? '#262626' : '#8e8e8e' }}
        >
          {post.likesCount || 0} likes
        </span>
      </div>

      {/* Details */}
      <div className="pc-details">
        <div className="pc-caption">
          <span className="pc-cap-username">{user?.username || user?.name}</span>
          <span className="pc-cap-text">{post.description}</span>
        </div>
        
        <div className="pc-badges">
          <span className="pc-badge badge-gold">{post.achievementLevel?.displayName || post.achievementLevel || 'Achievement'}</span>
          <span className="pc-badge badge-blue">{post.sport}</span>
          {post.points > 0 && <span className="pc-badge badge-purple">+{post.points} pts</span>}
        </div>

        <div className="pc-timestamp">
          {new Date(post.createdAt).toLocaleDateString(undefined, { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Likers Modal */}
      {showLikersModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '400px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #dbdbdb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>
                Likes
              </h3>
              <button
                onClick={() => setShowLikersModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#262626',
                  padding: '0 8px'
                }}
              >
                ×
              </button>
            </div>

            {/* Likers List */}
            <div style={{
              padding: '1rem',
              maxHeight: '60vh',
              overflowY: 'auto'
            }}>
              {loadingLikers ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  Loading...
                </div>
              ) : likers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#8e8e8e' }}>
                  No likes yet
                </div>
              ) : (
                likers.map(likingUser => (
                  <div
                    key={likingUser.id}
                    onClick={() => {
                      navigate(`/profile/${likingUser.id}`);
                      setShowLikersModal(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      marginBottom: '0.5rem'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: likingUser.profileImageUrl || likingUser.avatarUrl
                        ? `url(${likingUser.profileImageUrl || likingUser.avatarUrl})`
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      marginRight: '12px',
                      flexShrink: 0
                    }}>
                      {!likingUser.profileImageUrl && !likingUser.avatarUrl && getInitials(likingUser.name)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        color: '#262626'
                      }}>
                        {likingUser.username}
                      </div>
                      <div style={{
                        fontSize: '0.85rem',
                        color: '#8e8e8e'
                      }}>
                        {likingUser.name || likingUser.fullName}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
