import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import QuoteCard from './QuoteCard';
import CommentsPanel from './CommentsPanel';

const CATEGORIES = ['All', 'Philosophy', 'Dark', 'War', 'Love', 'Stoic'];

export default function Trending() {
  const [activeTab, setActiveTab] = useState('All');
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuoteForComments, setActiveQuoteForComments] = useState(null);

  useEffect(() => {
    const fetchQuotes = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('quotex_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const url = activeTab === 'All' 
          ? import.meta.env.VITE_API_URL + '/api/quotes' 
          : `${import.meta.env.VITE_API_URL}/api/quotes?category=${activeTab}`;
          
        const res = await fetch(url, { headers });
        const data = await res.json();
        setQuotes(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, [activeTab]);

  return (
    <section className="section-padding">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h2 className="section-title">
          <TrendingUp className="gradient-text-gold" /> Trending
        </h2>
        
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveTab(cat)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 500,
                background: activeTab === cat ? 'var(--text-main)' : 'transparent',
                color: activeTab === cat ? 'var(--bg-main)' : 'var(--text-muted)',
                border: `1px solid ${activeTab === cat ? 'var(--text-main)' : 'var(--border-color)'}`,
                transition: 'all var(--transition-fast)',
                cursor: 'pointer'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>Loading trending quotes...</div>
      ) : quotes.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
          No quotes found in this category.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {quotes.map(quote => (
            <QuoteCard key={quote.id} quote={quote} onOpenComments={setActiveQuoteForComments} />
          ))}
        </div>
      )}

      {/* Render Slide-out Comments Panel */}
      {activeQuoteForComments && (
        <CommentsPanel 
          quote={activeQuoteForComments} 
          onClose={() => setActiveQuoteForComments(null)} 
        />
      )}
    </section>
  );
}
