import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import CryptoJS from 'crypto-js';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Lock, Send, Copy, AlertTriangle } from 'lucide-react';

let socket;

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [roomData, setRoomData] = useState(null); // { id, key }
  const bottomRef = useRef(null);

  useEffect(() => {
    // Generate or parse URL hash for E2EE
    const hash = window.location.hash.substring(1);
    if (!hash || !hash.includes('|')) {
      const newRoom = Math.random().toString(36).substring(2, 10);
      const newKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      window.location.hash = `${newRoom}|${newKey}`;
      setRoomData({ id: newRoom, key: newKey });
      saveToInbox(newRoom, newKey);
    } else {
      const [id, key] = hash.split('|');
      setRoomData({ id, key });
      saveToInbox(id, key);
    }
  }, []);

  const saveToInbox = (id, key, lastMessage = '') => {
    try {
      const inbox = JSON.parse(localStorage.getItem('quotex_chat_inbox')) || [];
      const existingIdx = inbox.findIndex(r => r.id === id);
      const roomObj = { id, key, lastAccessed: Date.now(), lastMessage: lastMessage || (existingIdx >= 0 ? inbox[existingIdx].lastMessage : '') };
      
      if (existingIdx >= 0) {
        inbox[existingIdx] = roomObj;
      } else {
        inbox.push(roomObj);
      }
      
      inbox.sort((a, b) => b.lastAccessed - a.lastAccessed);
      localStorage.setItem('quotex_chat_inbox', JSON.stringify(inbox));
    } catch(e) { console.error(e) }
  };

  useEffect(() => {
    if (!roomData) return;

    socket = io(import.meta.env.VITE_API_URL);
    socket.emit('join_room', roomData.id);

    socket.on('receive_message', (data) => {
      // Decrypt incoming message
      try {
        const bytes = CryptoJS.AES.decrypt(data.encryptedText, roomData.key);
        const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
        setMessages(prev => [...prev, { ...data, text: decryptedText }]);
        saveToInbox(roomData.id, roomData.key, decryptedText);
      } catch (err) {
        console.error("Decryption failed for message", err);
      }
    });

    return () => socket.disconnect();
  }, [roomData]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) return <Navigate to="/login" replace />;

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !roomData) return;

    // Encrypt before sending
    const encryptedText = CryptoJS.AES.encrypt(input, roomData.key).toString();
    
    const msgData = {
      roomId: roomData.id,
      sender: user.name,
      avatar: user.avatarUrl || user.avatar,
      encryptedText,
      timestamp: new Date().toISOString()
    };

    socket.emit('send_message', msgData);
    
    // Add to local state
    setMessages(prev => [...prev, { ...msgData, text: input, isMine: true }]);
    saveToInbox(roomData.id, roomData.key, input);
    setInput('');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Secure chat link copied! Share it with someone to start chatting.');
  };

  if (!roomData) return <div>Loading secure environment...</div>;

  return (
    <div className="container" style={{ maxWidth: '800px', padding: '2rem 1.5rem', height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={18} style={{ color: '#10b981' }} /> Secure E2EE Chat
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Only people with this exact URL can read messages.</p>
        </div>
        <button onClick={copyLink} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Copy size={16} /> Copy Invite Link
        </button>
      </div>

      <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.length === 0 && (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
            <AlertTriangle size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>Messages are end-to-end encrypted.</p>
            <p style={{ fontSize: '0.85rem' }}>The server routes encrypted packets but cannot read them.</p>
          </div>
        )}
        
        {messages.map((m, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '1rem', alignSelf: m.isMine ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
            {!m.isMine && (
              <img src={m.avatar} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
            )}
            <div style={{ background: m.isMine ? 'var(--accent-purple)' : 'rgba(255,255,255,0.1)', padding: '0.75rem 1rem', borderRadius: '12px', borderBottomRightRadius: m.isMine ? 0 : '12px', borderBottomLeftRadius: !m.isMine ? 0 : '12px' }}>
              {!m.isMine && <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--accent-gold)' }}>{m.sender}</div>}
              <div style={{ fontSize: '0.95rem' }}>{m.text}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <input 
          type="text" 
          value={input} 
          onChange={e => setInput(e.target.value)}
          placeholder="Type an encrypted message..."
          style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '24px', color: 'white' }}
        />
        <button type="submit" className="btn btn-primary" style={{ width: '50px', height: '50px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
