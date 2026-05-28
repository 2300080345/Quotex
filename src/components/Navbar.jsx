import React, { useState, useRef, useEffect } from 'react';
import { Search, PenLine, User, Settings as SettingsIcon, LogOut, FileText, Menu, X, Sun, Moon, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
        setSearchQuery('');
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef, searchRef]);

  // Debounced Search
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/search?q=${encodeURIComponent(searchQuery)}`);
          const data = await res.json();
          setSearchResults(data);
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleCopyQuote = (text) => {
    navigator.clipboard.writeText(text);
    setSearchResults([]);
    setSearchQuery('');
    alert('Quote copied to clipboard!');
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <nav style={{ 
      position: 'sticky', top: 0, zIndex: 50, 
      background: 'rgba(9, 9, 11, 0.8)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-color)' 
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.05em' }}>
            QUOTEX<span style={{ color: 'var(--text-muted)' }}>.</span>
          </Link>
          <div className="nav-links" style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
            <Link to="/" className="nav-link hover:text-white">Home</Link>
            <Link to="/explore" className="nav-link hover:text-white">Explore</Link>
            <Link to="/leaderboard" className="nav-link hover:text-white">Leaderboard</Link>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div className="nav-search" style={{ position: 'relative' }} ref={searchRef}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '20px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search quotes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                color: 'var(--text-main)', padding: '0.5rem 1rem 0.5rem 2.2rem', borderRadius: '20px',
                fontSize: '0.85rem', width: '220px', transition: 'width 0.2s', marginTop: '4px'
              }}
            />
            
            {/* Search Results Dropdown */}
            {(searchResults.length > 0 || isSearching) && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 5px)', left: 0, width: '320px',
                background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)', overflow: 'hidden', zIndex: 100, animation: 'fadeIn 0.2s ease forwards'
              }}>
                {isSearching ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Searching...</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '350px', overflowY: 'auto' }}>
                    {searchResults.map(q => (
                      <div key={q.id} onClick={() => handleCopyQuote(q.text)} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.2s' }} className="hover:bg-zinc-800">
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase' }}>{q.category}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontStyle: 'italic' }}>"{q.text.substring(0, 80)}{q.text.length > 80 ? '...' : ''}"</div>
                      </div>
                    ))}
                    {searchResults.length === 0 && searchQuery.length > 1 && !isSearching && (
                      <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No quotes found.</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button onClick={toggleTheme} className="nav-links" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            {theme === 'dark' ? <Sun size={20} className="hover:text-white" /> : <Moon size={20} className="hover:text-black" />}
          </button>
          
          <Link to={user ? "/write" : "/login"} className="btn btn-primary nav-links" style={{ padding: '0.5rem 1.2rem', borderRadius: '20px', textDecoration: 'none' }}>
            <PenLine size={16} /> Write
          </Link>
          
          {user ? (
            <div style={{ position: 'relative' }} className="nav-links" ref={dropdownRef}>
              <div 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', overflow: 'hidden', border: '2px solid transparent', transition: 'border 0.2s' }}
                className="hover:border-zinc-500"
              >
                <img src={user.avatarUrl || user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', background: 'var(--bg-secondary)' }} />
              </div>

              {dropdownOpen && (
                <div style={{ 
                  position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: '220px',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)', overflow: 'hidden', animation: 'fadeIn 0.2s ease forwards'
                }}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                  </div>
                  <div style={{ padding: '0.5rem 0' }}>
                    <Link to="/profile" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }} className="hover:bg-zinc-800 hover:text-white">
                      <User size={16} /> My Profile
                    </Link>
                    <Link to="/my-quotes" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }} className="hover:bg-zinc-800 hover:text-white">
                      <FileText size={16} /> My Quotes
                    </Link>
                    <Link to="/inbox" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }} className="hover:bg-zinc-800 hover:text-white">
                      <MessageSquare size={16} /> Inbox
                    </Link>
                    <Link to="/settings" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }} className="hover:bg-zinc-800 hover:text-white">
                      <SettingsIcon size={16} /> Settings
                    </Link>
                  </div>
                  <div style={{ padding: '0.5rem 0', borderTop: '1px solid var(--border-color)' }}>
                    <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', width: '100%', textAlign: 'left', fontSize: '0.85rem', color: '#ef4444' }} className="hover:bg-zinc-800">
                      <LogOut size={16} /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="nav-links" style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: '20px' }}>Log In</Link>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: '20px', background: 'var(--accent-purple)', color: 'white' }}>Sign Up</Link>
            </div>
          )}
          
          <button 
            className="mobile-menu-btn" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ color: 'var(--text-main)', padding: '0.5rem' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.2s ease forwards' }}>
          <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem', fontWeight: 500 }}>Home</Link>
          <Link to="/explore" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem', fontWeight: 500 }}>Explore</Link>
          <Link to="/leaderboard" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem', fontWeight: 500 }}>Leaderboard</Link>
          <Link to={user ? "/write" : "/login"} onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem', fontWeight: 500, color: 'var(--accent-purple)' }}>Write a Quote</Link>
          
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }} />
          
          {user ? (
            <button onClick={handleLogout} style={{ padding: '0.5rem', fontWeight: 500, color: '#ef4444', textAlign: 'left' }}>Log Out</button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-outline" style={{ justifyContent: 'center' }}>Log In</Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ justifyContent: 'center' }}>Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
