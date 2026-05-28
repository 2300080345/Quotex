import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Hero() {
  const [quote, setQuote] = useState({ text: 'The obstacle in the path becomes the path.', author: 'Ryan Holiday' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/api/daily-quote')
      .then(res => res.json())
      .then(data => {
        if (data.text) setQuote(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <section style={{ padding: '6rem 0', background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.15) 0%, transparent 70%)' }} className="animate-fade-in text-center">
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent-gold)', marginBottom: '1.5rem', fontWeight: 600 }}>
          Quote of the Day
        </div>
        
        <div style={{ minHeight: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'center', transition: 'opacity 0.5s', opacity: loading ? 0 : 1 }}>
          <h1 className="hero-title" style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '2rem', letterSpacing: '-0.02em', textWrap: 'balance' }}>
            "{quote.text}"
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '3rem', fontWeight: 500 }}>
            — {quote.author}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/explore" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1.05rem', boxShadow: '0 0 20px rgba(168,85,247,0.3)', textDecoration: 'none' }}>
            Explore Library
          </Link>
          <Link to="/chat" className="btn btn-outline" style={{ padding: '0.85rem 2rem', fontSize: '1.05rem', textDecoration: 'none' }}>
            Join Secure Chat
          </Link>
        </div>
      </div>
    </section>
  );
}
