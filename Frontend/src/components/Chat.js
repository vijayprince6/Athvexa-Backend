import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import BottomNavbar from './BottomNavbar';

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(location.state?.selectedUser || null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (location.state?.selectedUser) {
      setSelectedUser(location.state.selectedUser);
      // Clear state so reload doesn't keep bringing up the chat if navigated away
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.selectedUser]);

  const fetchChatUsers = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/chat/users', {
        params: { userId },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUsers(response.data || []);
    } catch (err) {
      console.error('Failed to load chat users:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = useCallback(async () => {
    if (!searchQuery.trim()) {
      if (user && user.userId) {
        fetchChatUsers(user.userId);
      } else {
        setUsers([]);
      }
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/users/search`, {
        params: { query: searchQuery.trim() },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to search users');
      setUsers([]);
    }
  }, [searchQuery, user]);

  const fetchMessages = useCallback(async (otherUserId) => {
    if (!user) return;
    
    try {
      const currentUserId = user.userId || user.id;
      console.log('Fetching messages for', currentUserId, 'and', otherUserId);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/chat/conversation`, {
        params: {
          userId: currentUserId,
          otherUserId: otherUserId
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Fetched messages:', response.data);
      setMessages(response.data);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  }, [user]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);
    fetchChatUsers(userData.userId);
  }, [navigate]);

  // Real-time search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      // Just call searchUsers; it handles empty searchQuery correctly now
      searchUsers();
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
    }
  }, [selectedUser, fetchMessages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !user) return;

    try {
      const currentUserId = user.userId || user.id;
      console.log('Sending message from', currentUserId, 'to', selectedUser.username);
      const token = localStorage.getItem('token');
      await axios.post(`/api/chat/send`, null, {
        params: {
          senderId: currentUserId,
          receiverUsername: selectedUser.username,
          content: newMessage
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setNewMessage('');
      fetchMessages(selectedUser.id);
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };



  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.trim().charAt(0).toUpperCase();
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div style={{ 
      fontFamily: "'-apple-system', BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", 
      backgroundColor: '#fff', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden', 
      maxWidth: 1400, 
      margin: '0 auto', 
      position: 'relative', 
      width: '100%', 
      boxShadow: '0 0 20px rgba(0,0,0,0.05)' 
    }}>

      {/* Chat Interface */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', backgroundColor: '#fff' }}>

        {/* ── Users List ── */}
        <div style={{
          width: isMobile ? '100%' : '350px',
          display: (isMobile && selectedUser) ? 'none' : 'flex',
          flexDirection: 'column',
          backgroundColor: 'white',
          borderRight: '1px solid #e0e0e0',
          flexShrink: 0
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            position: 'sticky',
            top: 0,
            backgroundColor: '#fff',
            zIndex: 10,
          }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#111', flex: 1, letterSpacing: -0.3 }}>Messages</span>
          </div>

          {/* Search */}
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #f0f0f0' }}>
            <input
              type="text"
              placeholder="🔍  Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: 'none',
                borderRadius: 12,
                backgroundColor: '#f5f5f5',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* User list */}
          <div style={{ flex: 1, overflowY: 'auto', paddingBottom: isMobile ? 80 : 0 }}>
            {users.length === 0 && searchQuery.trim() === '' && (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: '#aaa' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                <p style={{ fontWeight: 600, color: '#555', fontSize: 15, marginBottom: 6 }}>Search to start chatting</p>
                <p style={{ fontSize: 13 }}>Find people by name or username</p>
              </div>
            )}
            {users.length === 0 && searchQuery.trim() !== '' && (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: '#aaa' }}>
                <p style={{ fontSize: 14 }}>No users found for "{searchQuery}"</p>
              </div>
            )}
            {users.map((chatUser) => {
              const isSelected = selectedUser?.id === chatUser.id;
              return (
                <div
                  key={chatUser.id}
                  onClick={() => setSelectedUser(chatUser)}
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #f5f5f5',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    transition: 'background 0.15s',
                    backgroundColor: isSelected ? '#f0f4ff' : 'transparent',
                  }}
                  onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f9f9f9'; }}
                  onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 18, flexShrink: 0,
                  }}>
                    {getInitials(chatUser.name)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#111', fontSize: 15 }}>{chatUser.name}</div>
                    <div style={{ color: '#888', fontSize: 13 }}>@{chatUser.username}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Active Chat Area ── */}
        <div style={{
          flex: 1,
          display: (isMobile && !selectedUser) ? 'none' : 'flex',
          flexDirection: 'column',
          width: '100%',
          backgroundColor: '#e5ddd5', // WhatsApp-like background color
          backgroundImage: 'radial-gradient(#d1c9c0 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}>
          {selectedUser && String(selectedUser.id) === String(user?.userId || user?.id) ? (
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#888', 
              gap: 16,
              padding: '24px',
              textAlign: 'center',
              boxSizing: 'border-box',
              width: '100%'
            }}>
              <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                👤
              </div>
              <h3 style={{ color: '#444', fontWeight: 600, margin: 0 }}>That's you!</h3>
              <p style={{ fontSize: 14, color: '#888', textAlign: 'center', maxWidth: 260, margin: '0 auto' }}>
                You can't chat with yourself. Search for another coach or player to start a conversation.
              </p>
              <button
                onClick={() => setSelectedUser(null)}
                style={{ marginTop: 8, padding: '10px 24px', background: 'linear-gradient(45deg, #667eea, #764ba2)', color: '#fff', border: 'none', borderRadius: 24, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                ← Back to Messages
              </button>
            </div>
          ) : selectedUser ? (
            <>
              {/* Chat header */}
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#fff',
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}>
                {isMobile && (
                  <button
                    onClick={() => setSelectedUser(null)}
                    style={{
                      border: 'none', background: 'none',
                      fontSize: '1.4rem', cursor: 'pointer',
                      color: '#667eea', padding: '0 4px',
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    ←
                  </button>
                )}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 16, flexShrink: 0,
                }}>
                  {getInitials(selectedUser.name)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#111', fontSize: 15 }}>{selectedUser.name}</div>
                  <div style={{ color: '#888', fontSize: 12 }}>@{selectedUser.username}</div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {messages.length === 0 && (
                  <div style={{ alignSelf: 'center', backgroundColor: '#fff', padding: '8px 16px', borderRadius: 16, color: '#555', fontSize: 13, marginTop: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                    No messages yet. Say hi! 👋
                  </div>
                )}
                {messages.map((message) => {
                  const currentUserId = String(user.userId || user.id);
                  const isMine = String(message.sender?.id || message.senderId) === currentUserId;
                  return (
                    <div
                      key={message.id}
                      style={{
                        marginBottom: 8,
                        display: 'flex',
                        justifyContent: isMine ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div style={{
                        padding: '8px 12px',
                        backgroundColor: isMine ? '#dcf8c6' : '#fff', // WhatsApp colors
                        color: '#111',
                        borderRadius: '8px',
                        borderTopRightRadius: isMine ? '0' : '8px',
                        borderTopLeftRadius: !isMine ? '0' : '8px',
                        maxWidth: '75%',
                        fontSize: 14.5,
                        lineHeight: 1.4,
                        boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                      }}>
                        {message.content}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input bar */}
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#f0f0f0',
                display: 'flex',
                gap: 12,
                alignItems: 'center',
              }}>
                <input
                  type="text"
                  placeholder="Type a message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  enterKeyHint="send"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: 24,
                    backgroundColor: '#fff',
                    fontSize: 15,
                    outline: 'none',
                    boxShadow: '0 1px 1px rgba(0,0,0,0.05)',
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  style={{
                    width: 44, height: 44,
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: newMessage.trim() ? '#00a884' : '#e0e0e0', // WhatsApp green
                    color: '#fff',
                    fontSize: 18,
                    cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s',
                    flexShrink: 0,
                    boxShadow: newMessage.trim() ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
                  }}
                >
                  ➤
                </button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
               <div style={{ width: 120, height: 120, borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                 <span style={{ fontSize: 48 }}>💬</span>
               </div>
               <h2 style={{ color: '#555', fontWeight: 300, marginBottom: 8 }}>Athvexa Messages</h2>
               <p>Select a user to start messaging.</p>
            </div>
          )}
        </div>
      </div>

      {isMobile && !selectedUser && <div className="bottom-nav-spacer"></div>}
      {isMobile && !selectedUser && <BottomNavbar />}
    </div>
  );
};

export default Chat;
