import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SeasonalBanner() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(59, 130, 246, 0.1))',
      border: '1px solid rgba(168, 85, 247, 0.3)',
      borderRadius: '12px',
      padding: '2rem',
      marginBottom: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
          <Sparkles size={12} /> Special Event
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Philosophy Week</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '80%' }}>
          May 26 — June 1. Submit your best philosophy quote. Top 3 get featured on the homepage.
        </p>
        <Link to="/write" className="btn" style={{ background: 'var(--text-main)', color: 'var(--bg-main)', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
          Enter Now <ArrowRight size={16} />
        </Link>
      </div>
      
      {/* Decorative background blur */}
      <div style={{ position: 'absolute', right: '-20%', bottom: '-50%', width: '150px', height: '150px', background: 'var(--accent-purple)', filter: 'blur(80px)', opacity: 0.5, borderRadius: '50%' }}></div>
    </div>
  );
}
