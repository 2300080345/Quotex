import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Write from './pages/Write';
import Explore from './pages/Explore';
import LeaderboardPage from './pages/LeaderboardPage';
import Profile from './pages/Profile';
import MyQuotes from './pages/MyQuotes';
import Settings from './pages/Settings';
import Chat from './pages/Chat';

import Inbox from './pages/Inbox';
import AmbientPlayer from './components/AmbientPlayer';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app">
            <AmbientPlayer />
            <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/write" element={<Write />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-quotes" element={<MyQuotes />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/inbox" element={<Inbox />} />
          </Routes>
          <Footer />
        </div>
      </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
