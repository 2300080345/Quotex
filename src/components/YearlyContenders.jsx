import React from 'react';
import { Crown } from 'lucide-react';

const MONTHS = [
  { month: 'January', quote: "Silence is the loudest war.", color: '#3b82f6' },
  { month: 'February', quote: "Time heals everything it doesn't bury.", color: '#10b981' },
  { month: 'March', quote: "A kingdom falls long before its walls break.", color: '#f59e0b' }
];

export default function YearlyContenders() {
  return (
    <section className="card" style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Crown size={20} style={{ color: 'var(--accent-gold)' }} /> Yearly Contenders
        </h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>Prestige</span>
      </div>
      
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Monthly winners building toward Quote of the Year.
      </p>

      <div className="yearly-grid">
        {MONTHS.map((m, idx) => (
          <div key={idx} style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: `3px solid ${m.color}`, position: 'relative' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: m.color, marginBottom: '0.5rem' }}>{m.month}</div>
            <p style={{ fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.4 }}>"{m.quote}"</p>
          </div>
        ))}
      </div>
    </section>
  );
}
