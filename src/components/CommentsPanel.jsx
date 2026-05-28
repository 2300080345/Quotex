import React, { useState, useEffect } from 'react';
import { X, Send, Crown, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CommentsPanel({ quote, onClose }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');

  // Re-use Badge Logic
  const getBadge = (likes) => {
    if (likes >= 100) return <Crown size={12} color="#fbbf24" fill="#fbbf24" style={{ filter: 'drop-shadow(0 0 5px #fbbf24)' }} />;
    if (likes >= 10) return <Star size={12} color="#a1a1aa" fill="#a1a1aa" style={{ filter: 'drop-shadow(0 0 3px #a1a1aa)' }} />;
    return null;
  };

  useEffect(() => {
    if (!quote) return;
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/quotes/${quote.id}/comments`)
      .then(res => res.json())
      .then(data => {
        setComments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [quote]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user) return;

    try {
      const token = localStorage.getItem('quotex_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/quotes/${quote.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text })
      });
      const newComment = await res.json();
      setComments([newComment, ...comments]);
      setText('');
    } catch (err) {
      console.error(err);
    }
  };

  if (!quote) return null;

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 100, animation: 'fadeIn 0.2s forwards' }} />
      
      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '400px',
        background: 'var(--bg-main)', borderLeft: '1px solid var(--border-color)',
        zIndex: 101, display: 'flex', flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.5)', transform: 'translateX(0)',
        animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}>
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Comments</h2>
          <button onClick={onClose} style={{ padding: '0.5rem', color: 'var(--text-muted)' }} className="hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Quote Reference */}
        <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
          <p style={{ fontStyle: 'italic', color: 'var(--text-main)', marginBottom: '0.5rem' }}>"{quote.text}"</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>— {quote.authorName || 'Anonymous'}</p>
        </div>

        {/* Comment List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {loading ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Loading comments...</div>
          ) : comments.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>No comments yet. Be the first!</div>
          ) : (
            comments.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: '1rem' }}>
                <img src={c.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.userId}`} alt="Avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', background: 'var(--bg-secondary)' }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {c.userName}
                      {getBadge(c.userTotalLikes || 0)}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{c.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
          {user ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                placeholder="Add a comment..."
                value={text}
                onChange={e => setText(e.target.value)}
                style={{ flex: 1, padding: '0.75rem 1rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '24px', color: 'var(--text-main)', fontSize: '0.9rem' }}
              />
              <button type="submit" disabled={!text.trim()} style={{ background: text.trim() ? 'var(--accent-purple)' : 'var(--bg-main)', color: text.trim() ? 'white' : 'var(--text-muted)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: text.trim() ? 'none' : '1px solid var(--border-color)', transition: 'all 0.2s' }}>
                <Send size={16} style={{ transform: 'translateX(-1px)' }} />
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Log in to join the conversation.
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
