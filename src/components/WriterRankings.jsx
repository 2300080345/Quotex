import React from 'react';
import { Medal } from 'lucide-react';

const RANKINGS = [
  { name: 'Bronze Writer', req: '100+ likes', icon: '🥉', color: '#cd7f32' },
  { name: 'Silver Writer', req: '1,000+ likes', icon: '🥈', color: '#c0c0c0' },
  { name: 'Golden Author', req: '10,000+ likes', icon: '🥇', color: '#ffd700' },
];

export default function WriterRankings() {
  return (
    <div className="card" style={{ position: 'sticky', top: '100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
        <Medal size={20} style={{ color: 'var(--text-muted)' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Writer Rankings</h3>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {RANKINGS.map((rank, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
              {rank.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{rank.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rank.req}</div>
            </div>
          </div>
        ))}
        
        {/* Legendary Voice highlighted card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', marginTop: '0.5rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', boxShadow: '0 0 10px rgba(168,85,247,0.5)' }}>
            👑
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e9d5ff' }}>Legendary Voice</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Won Quote of the Year</div>
          </div>
        </div>
      </div>
    </div>
  );
}
