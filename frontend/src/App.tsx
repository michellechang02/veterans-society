import React from 'react';
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import Profile from './components/Profile';
import Groups from './components/Groups';
import Chat from './components/Chat';
import Feed from './components/Feed';
import Donate from './components/Donate';
import Fitness from './components/Fitness';

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dynamic Routes */}
        <Route path="/:username/users" element={<Profile />} />
        <Route path="/:username/groups" element={<Groups />} />
        <Route path="/:username/chat" element={<Chat />} />
        <Route path="/:username/feed" element={<Feed />} />
        <Route path="/:username/fitness" element={<Fitness />} />
        <Route path="/:username/donate" element={<Donate />} />
      </Routes>
    </Router>
  );
};

export default App;
