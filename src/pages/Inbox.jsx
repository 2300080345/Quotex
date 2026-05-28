import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Inbox as InboxIcon, Lock, ChevronRight, Trash2 } from 'lucide-react';

export default function Inbox() {
  const { user } = useAuth();
  const [inbox, setInbox] = useState([]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('quotex_chat_inbox')) || [];
      setInbox(saved);
    } catch(e) {
      console.error(e);
    }
  }, []);

  const handleDelete = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = inbox.filter(r => r.id !== id);
    setInbox(updated);
    localStorage.setItem('quotex_chat_inbox', JSON.stringify(updated));
  };

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', minHeight: '60vh', maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <InboxIcon size={36} className="gradient-text-gold" style={{ strokeWidth: 2 }} /> Secure Inbox
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Your end-to-end encrypted chat history.</p>
        </div>
        <Link to="/chat" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>+ New Secure Chat</Link>
      </div>

      {inbox.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Lock size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No chats found on this device.</p>
          <p style={{ fontSize: '0.85rem' }}>E2EE chats are only saved locally in your browser.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {inbox.map(room => (
            <Link 
              key={room.id} 
              to={`/chat#${room.id}|${room.key}`} 
              className="card" 
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none', padding: '1.5rem', cursor: 'pointer' }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>Chat Room #{room.id}</span>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>E2EE Active</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '500px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {room.lastMessage ? `"${room.lastMessage}"` : "No messages yet"}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(room.lastAccessed).toLocaleDateString()}
                </div>
                <button onClick={(e) => handleDelete(room.id, e)} style={{ color: '#ef4444', opacity: 0.5, transition: 'opacity 0.2s' }} className="hover:opacity-100">
                  <Trash2 size={18} />
                </button>
                <ChevronRight size={24} style={{ color: 'var(--text-muted)' }} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
