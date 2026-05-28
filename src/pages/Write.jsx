import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { PenTool, CheckCircle } from 'lucide-react';

export default function Write() {
  const { user } = useAuth();
  const [quote, setQuote] = useState('');
  const [category, setCategory] = useState('Philosophy');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const token = localStorage.getItem('quotex_token');
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: quote, category })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setQuote('');
      }, 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px', padding: '4rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1rem', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '12px' }}>
          <PenTool style={{ color: 'var(--accent-gold)' }} size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Submit Your Quote</h1>
          <p style={{ color: 'var(--text-muted)' }}>Share your masterpiece with the community</p>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        {submitted ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', textAlign: 'center' }}>
            <CheckCircle size={64} style={{ color: '#10b981', marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Quote Saved!</h2>
            <p style={{ color: 'var(--text-muted)' }}>Your quote has been stored in the database successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {error && <div style={{ color: '#ef4444', padding: '1rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>{error}</div>}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Your Quote</label>
              <textarea value={quote} onChange={(e) => setQuote(e.target.value)} placeholder='"Type your quote here..."' required rows={5} style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '1.2rem', fontFamily: 'var(--font-sans)', resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>
                <option value="Philosophy">Philosophy</option>
                <option value="Dark">Dark</option>
                <option value="War">War</option>
                <option value="Love">Love</option>
                <option value="Stoic">Stoic</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>Submit to Database</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
