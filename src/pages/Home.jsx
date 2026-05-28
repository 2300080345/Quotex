import React from 'react';
import Hero from '../components/Hero';
import Trending from '../components/Trending';
import Leaderboard from '../components/Leaderboard';
import SeasonalBanner from '../components/SeasonalBanner';
import YearlyContenders from '../components/YearlyContenders';
import WriterRankings from '../components/WriterRankings';

export default function Home() {
  return (
    <>
      <Hero />
      <div className="container">
        <Trending />
        <div className="main-grid">
          <div>
            <Leaderboard />
            <SeasonalBanner />
            <YearlyContenders />
          </div>
          <aside>
            <WriterRankings />
          </aside>
        </div>
      </div>
    </>
  );
}
