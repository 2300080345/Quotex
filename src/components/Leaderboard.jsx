import React from 'react';
import { BarChart3, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const TOP_QUOTES = [
  { id: 1, text: "Silence is the loudest war.", score: "890,200" },
  { id: 2, text: "Time heals everything it doesn't bury.", score: "724,500" },
  { id: 3, text: "A kingdom falls long before its walls break.", score: "636,400" },
];

export default function Leaderboard() {
  return (
    <section className="card" style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={20} style={{ color: 'var(--accent-purple)' }} /> Monthly Leaderboard
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--accent-gold)', background: 'rgba(251, 191, 36, 0.1)', padding: '0.25rem 0.75rem', borderRadius: '12px' }}>
          <Clock size={14} /> 4d 12h left
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {TOP_QUOTES.map((quote, idx) => (
          <div key={quote.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '0.5rem', borderRadius: '8px', transition: 'background var(--transition-fast)', cursor: 'pointer' }} className="hover:bg-zinc-800">
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: idx === 0 ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
              #{idx + 1}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 500, fontSize: '0.95rem', marginBottom: '0.25rem' }}>"{quote.text}"</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Score: {quote.score}</p>
            </div>
          </div>
        ))}
      </div>
      
      <Link to="/leaderboard" style={{ display: 'block', textAlign: 'center', width: '100%', marginTop: '1.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 500, border: '1px solid var(--border-color)', textDecoration: 'none' }}>
        View Full Leaderboard
      </Link>
    </section>
  );
}
