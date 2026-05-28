import React from 'react';
import Leaderboard from '../components/Leaderboard';

export default function LeaderboardPage() {
  return (
    <div className="container" style={{ padding: '4rem 1.5rem', minHeight: '60vh', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem', textAlign: 'center' }}>Top Quotes This Month</h1>
      <Leaderboard />
    </div>
  );
}
