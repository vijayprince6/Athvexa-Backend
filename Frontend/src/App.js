import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';

// Import components
import Login from './components/Login';
import Register from './components/Register';
import CompleteProfile from './components/CompleteProfile';
import Home from './components/Home';
import Chat from './components/Chat';
import Camera from './components/Camera';
import Profile from './components/Profile';
import EditProfile from './components/EditProfile';
import Rankings from './components/Rankings';
import Post from './components/Post';
import Coaches from './components/Coaches';
import SportCoaches from './components/SportCoaches';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/home" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/camera" element={<Camera />} />
          <Route path="/post" element={<Post />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/rankings" element={<Rankings />} />
          <Route path="/coaches" element={<Coaches />} />
          <Route path="/coaches/:sport" element={<SportCoaches />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
