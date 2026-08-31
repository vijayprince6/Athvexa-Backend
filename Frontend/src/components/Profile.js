import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import BottomNavbar from './BottomNavbar';
import PostCard from './PostCard';

const Profile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'feed'
  const [initialPostIndex, setInitialPostIndex] = useState(0);
  
  const navigate = useNavigate();
  const postRefs = useRef([]);

  // Current logged in user
  const localUser = JSON.parse(localStorage.getItem('user') || '{}');
  const loggedInUserId = (localUser.userId || localUser.id)?.toString();
  const targetUserId = (userId || loggedInUserId)?.toString();
  const isOwnProfile = !userId || (loggedInUserId && userId === loggedInUserId);

  const loadProfileData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch user profile
      const userRes = await axios.get(`/api/users/${targetUserId}`, { headers });
      
      if (!userRes.data) {
        throw new Error('User not found. Please login again.');
      }
      
      setUser(userRes.data);

      // Fetch user posts
      const postsRes = await axios.get(`/api/posts/user/${targetUserId}`, {
        headers,
        params: { currentUserId: loggedInUserId }
      });
      
      console.log('Posts response:', postsRes.data);
      
      // Ensure descending order (newest first)
      const sortedPosts = (postsRes.data || []).sort((a, b) => 
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      setUserPosts(sortedPosts);

      // If it's own profile, update local storage to keep sync
      if (isOwnProfile) {
        localStorage.setItem('user', JSON.stringify({
          ...localUser,
          ...userRes.data,
          userId: userRes.data.id ? userRes.data.id.toString() : localUser.userId
        }));
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      // If user not found (404), clear localStorage and redirect to login
      if (err.response?.status === 404) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        alert('User not found. Please login again.');
        navigate('/login');
        return;
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Could not load posts.';
      setError(`${errorMessage} (Status: ${err.response?.status || 'unknown'})`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loggedInUserId) {
      navigate('/login');
      return;
    }
    loadProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUserId, navigate, loggedInUserId]);

  const handlePostClick = (index) => {
    setInitialPostIndex(index);
    setViewMode('feed');
  };

  useEffect(() => {
    if (viewMode === 'feed' && postRefs.current[initialPostIndex]) {
      // Small timeout to ensure DOM is ready and styles are applied
      setTimeout(() => {
        postRefs.current[initialPostIndex].scrollIntoView({ behavior: 'auto', block: 'start' });
      }, 50);
    }
  }, [viewMode, initialPostIndex]);

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/likes/like', null, {
        params: { userId: loggedInUserId, postId: postId },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state for immediate feedback
      setUserPosts(prevPosts => prevPosts.map(post => {
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
      await axios.delete(`/api/posts/${postId}`, {
        params: { userId: loggedInUserId },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setUserPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      
      // Update points if it's the user's own profile
      if (isOwnProfile && user) {
        const newPoints = Math.max(0, (user.totalPoints || 0) - (postPoints || 0));
        const updatedUser = { ...user, totalPoints: newPoints };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify({
          ...localUser,
          ...updatedUser
        }));
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert('Failed to delete post');
    }
  };

  const logout = () => {
    if (window.confirm('Logout?')) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const initial = () => {
    const name = user?.name || user?.fullName || user?.username || 'U';
    return name.charAt(0).toUpperCase();
  };

  if (loading && !user) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading Profile...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* ── Top Bar ── */}
      <div style={styles.topBar}>
        <div style={styles.topBarLeft}>
          {userId && (
            <button onClick={() => navigate(-1)} style={styles.backButton}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
          )}
          <span style={styles.usernameTitle}>{user?.username || 'Profile'}</span>
        </div>
        <div style={styles.topBarRight}>
          {isOwnProfile ? (
            <>
              <button onClick={() => navigate('/edit-profile')} style={styles.iconButton}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button onClick={logout} style={styles.iconButton}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </>
          ) : (
            <button 
              onClick={() => navigate('/chat', { 
                state: { 
                  selectedUser: { 
                    id: targetUserId, 
                    username: user?.username, 
                    name: user?.name || user?.fullName || user?.username 
                  } 
                } 
              })} 
              style={styles.iconButton}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div style={styles.scrollContent}>
        {error && (
          <div className="error-banner" style={{ margin: '16px', padding: '10px', backgroundColor: '#fee', color: '#c00', borderRadius: '4px' }}>
            {error}
          </div>
        )}
        {/* ── Profile Header ── */}
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <div style={styles.avatarWrapper}>
              <div style={styles.avatarRing}>
                {user?.profileImageUrl || user?.avatarUrl ? (
                  <img src={user.profileImageUrl || user.avatarUrl} alt="profile" style={styles.avatarImg} />
                ) : (
                  <div style={styles.avatarInitial}>{initial()}</div>
                )}
              </div>
            </div>
            
            <div style={styles.statsRow}>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>{userPosts.length}</span>
                <span style={styles.statLabel}>Posts</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>{user?.totalPoints || 0}</span>
                <span style={styles.statLabel}>Points</span>
              </div>
            </div>
          </div>

          <div style={styles.bioSection}>
            <h1 style={styles.fullName}>{user?.name || user?.fullName || user?.username}</h1>
            
            {/* Coach Badge and Sport */}
            {user?.role === 'COACH' && user?.sport && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                marginBottom: '8px',
                boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)'
              }}>
                <span>🏅 Coach</span>
                <span>•</span>
                <span>
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
                  {user.sport.charAt(0).toUpperCase() + user.sport.slice(1).replace(/([A-Z])/g, ' $1')}
                </span>
              </div>
            )}
            
            <p style={styles.occupation}>{user?.occupationName || user?.occupation || 'Athlete'}</p>
            {user?.bio ? (
              <p style={styles.bioText}>{user.bio}</p>
            ) : isOwnProfile ? (
              <p style={styles.bioPlaceholder} onClick={() => navigate('/edit-profile')}>Add a bio to your profile...</p>
            ) : null}
          </div>

          {/* ── Action Buttons ── */}
          <div style={styles.actionButtons}>
            {isOwnProfile ? (
              <button onClick={() => navigate('/edit-profile')} style={styles.primaryButton}>
                Edit Profile
              </button>
            ) : (
              <button 
                onClick={() => navigate('/chat', { 
                  state: { 
                    selectedUser: { 
                      id: targetUserId, 
                      username: user?.username, 
                      name: user?.name || user?.fullName || user?.username 
                    } 
                  } 
                })} 
                style={styles.primaryButtonHighlight}
              >
                Message
              </button>
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={styles.tabs}>
          <div style={{ ...styles.tabItem, ...(viewMode === 'grid' ? styles.activeTab : {}) }} onClick={() => setViewMode('grid')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
          </div>
          <div style={{ ...styles.tabItem, ...(viewMode === 'feed' ? styles.activeTab : {}) }} onClick={() => setViewMode('feed')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </div>
        </div>

        {/* ── Posts Content ── */}
        {userPosts.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#dbdbdb" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <h2 style={styles.emptyTitle}>No Posts Yet</h2>
            <p style={styles.emptyText}>When {isOwnProfile ? 'you' : user?.username} share photos or videos, they will appear here.</p>
            {isOwnProfile && (
              <button onClick={() => navigate('/post')} style={styles.shareLink}>Share your first achievement</button>
            )}
          </div>
        ) : (
          <div style={viewMode === 'grid' ? styles.grid : styles.feed}>
            {userPosts.map((post, index) => (
              <div 
                key={post.id} 
                ref={el => postRefs.current[index] = el}
                onClick={() => viewMode === 'grid' && handlePostClick(index)}
                style={viewMode === 'grid' ? styles.gridItem : styles.feedItem}
              >
                {viewMode === 'grid' ? (
                  <div style={styles.gridImageContainer}>
                    {post.imageUrl?.match(/\.(mp4|mov|webm)$/i) || post.imageUrl?.includes('video/upload') ? (
                       <div style={styles.videoThumbnail}>
                         <video src={post.imageUrl} style={styles.gridImage} muted />
                         <div style={styles.videoIcon}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                         </div>
                       </div>
                    ) : (
                      <img src={post.imageUrl} alt="post" style={styles.gridImage} loading="lazy" />
                    )}
                    {post.sport && (
                      <div style={styles.gridOverlay}>
                        <span style={styles.gridSport}>{post.sport}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <PostCard 
                    post={post} 
                    onLike={() => handleLike(post.id)}
                    onDelete={handleDeletePost}
                    currentUserId={loggedInUserId}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="bottom-nav-spacer" />
      </div>

      {/* ── Feed Header Overlay ── */}
      {viewMode === 'feed' && (
        <div style={styles.feedHeaderFixed}>
          <button onClick={() => setViewMode('grid')} style={styles.backButton}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <span style={styles.feedHeaderText}>Posts</span>
        </div>
      )}

      <BottomNavbar />
    </div>
  );
};


const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    backgroundColor: '#fff',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    maxWidth: 800,
    margin: '0 auto',
    position: 'relative',
    width: '100%',
    boxShadow: '0 0 20px rgba(0,0,0,0.05)',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#fff',
  },
  spinner: {
    width: 32,
    height: 32,
    border: '2px solid #dbdbdb',
    borderTop: '2px solid #262626',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    marginTop: 16,
    color: '#8e8e8e',
    fontSize: 14,
    fontWeight: 500,
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 16px',
    height: 44,
    borderBottom: '1px solid #efefef',
    position: 'relative',
    zIndex: 100,
    backgroundColor: '#fff',
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    color: '#262626',
    display: 'flex',
    alignItems: 'center',
  },
  usernameTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#262626',
  },
  topBarRight: {
    display: 'flex',
    gap: 16,
  },
  iconButton: {
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    color: '#262626',
    display: 'flex',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    WebkitOverflowScrolling: 'touch',
    paddingBottom: '80px',
  },
  header: {
    padding: '16px 16px 24px',
  },
  headerTop: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 20,
    gap: 32,
  },
  avatarWrapper: {
    flexShrink: 0,
  },
  avatarRing: {
    width: 86,
    height: 86,
    borderRadius: '50%',
    padding: 3,
    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #fff',
  },
  avatarInitial: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    backgroundColor: '#fafafa',
    border: '3px solid #fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 32,
    fontWeight: 800,
    color: '#262626',
  },
  statsRow: {
    display: 'flex',
    flex: 1,
    justifyContent: 'space-around',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 700,
    color: '#262626',
  },
  statLabel: {
    fontSize: 13,
    color: '#262626',
  },
  bioSection: {
    marginBottom: 16,
  },
  fullName: {
    fontSize: 15,
    fontWeight: 700,
    margin: '0 0 2px',
    color: '#262626',
  },
  occupation: {
    fontSize: 14,
    color: '#8e8e8e',
    margin: '0 0 8px',
  },
  bioText: {
    fontSize: 14,
    lineHeight: '18px',
    color: '#262626',
    whiteSpace: 'pre-wrap',
    margin: 0,
  },
  bioPlaceholder: {
    fontSize: 14,
    color: '#0095f6',
    cursor: 'pointer',
    margin: 0,
  },
  pointsBadge: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 10,
    fontSize: 13,
    fontWeight: 600,
    color: '#262626',
    backgroundColor: '#f5f5f5',
    padding: '6px 12px',
    borderRadius: 6,
    alignSelf: 'flex-start',
    width: 'fit-content',
  },
  actionButtons: {
    display: 'flex',
    gap: 8,
    marginTop: 20,
  },
  primaryButton: {
    flex: 1,
    height: 32,
    backgroundColor: '#efefef',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    color: '#262626',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonHighlight: {
    flex: 1,
    height: 32,
    backgroundColor: '#0095f6',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    flex: 1,
    height: 32,
    backgroundColor: '#efefef',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    color: '#262626',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    display: 'flex',
    borderTop: '1px solid #efefef',
  },
  tabItem: {
    flex: 1,
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#8e8e8e',
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  activeTab: {
    color: '#262626',
    borderTop: '1px solid #262626',
    marginTop: -1,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 2,
    padding: 0,
  },
  gridItem: {
    aspectRatio: '1/1',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
  },
  gridImageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  videoIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: '50%',
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '4px 8px',
    background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
  },
  gridSport: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },
  feed: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    backgroundColor: '#fff',
  },
  feedItem: {
    borderBottom: '1px solid #efefef',
  },
  emptyState: {
    padding: '80px 40px',
    textAlign: 'center',
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 800,
    margin: '0 0 10px',
    color: '#262626',
  },
  emptyText: {
    fontSize: 14,
    color: '#8e8e8e',
    lineHeight: '18px',
    margin: '0 0 24px',
  },
  shareLink: {
    color: '#0095f6',
    fontWeight: 600,
    fontSize: 14,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  feedHeaderFixed: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 44,
    backgroundColor: '#fff',
    borderBottom: '1px solid #efefef',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    gap: 20,
    zIndex: 110,
  },
  feedHeaderText: {
    fontSize: 16,
    fontWeight: 700,
    color: '#262626',
  },
  // PostCard Styles
  pcContainer: {
    backgroundColor: '#fff',
    marginBottom: 0,
  },
  pcHeader: {
    height: 52,
    padding: '0 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pcUser: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  pcAvatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: '#efefef',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #efefef',
  },
  pcAvatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  pcAvatarInitial: {
    fontSize: 15,
    fontWeight: 700,
    color: '#262626',
  },
  pcUserInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  pcUsername: {
    fontSize: 14,
    fontWeight: 600,
    color: '#262626',
  },
  pcLocation: {
    fontSize: 12,
    color: '#262626',
  },
  pcMoreBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#262626',
    padding: 8,
  },
  pcImageContainer: {
    width: '100%',
    backgroundColor: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
  },
  pcImage: {
    width: '100%',
    maxHeight: '80vh',
    objectFit: 'contain',
  },
  pcActions: {
    height: 48,
    padding: '0 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pcActionsLeft: {
    display: 'flex',
    gap: 16,
  },
  pcActionBtn: {
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    color: '#262626',
    display: 'flex',
    alignItems: 'center',
    transition: 'transform 0.1s',
  },
  pcDetails: {
    padding: '0 12px 20px',
  },
  pcLikes: {
    fontSize: 14,
    fontWeight: 700,
    color: '#262626',
    marginBottom: 8,
    display: 'block',
  },
  pcCaption: {
    fontSize: 14,
    lineHeight: '18px',
    color: '#262626',
  },
  pcCapUser: {
    fontWeight: 700,
    marginRight: 8,
  },
  pcCapText: {
    fontWeight: 400,
  },
  pcTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  pcTag: {
    fontSize: 13,
    color: '#00376b',
    fontWeight: 500,
    backgroundColor: '#f0f9ff',
    padding: '2px 8px',
    borderRadius: 4,
  },
  pcTime: {
    display: 'block',
    fontSize: 11,
    color: '#8e8e8e',
    textTransform: 'uppercase',
    marginTop: 14,
    letterSpacing: '0.2px',
  },
};

export default Profile;
