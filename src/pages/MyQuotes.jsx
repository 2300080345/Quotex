import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Quote } from 'lucide-react';
import QuoteCard from '../components/QuoteCard';
import CommentsPanel from '../components/CommentsPanel';

export default function MyQuotes() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuoteForComments, setActiveQuoteForComments] = useState(null);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const token = localStorage.getItem('quotex_token');
        const res = await fetch(import.meta.env.VITE_API_URL + '/api/user/quotes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setQuotes(data);
      } catch (err) {
        console.error("Error fetching quotes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', minHeight: '60vh', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>My Quotes</h1>
      
      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading your quotes...</div>
      ) : quotes.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Quote size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
          <p>You haven't submitted any quotes yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {quotes.map(q => (
            <QuoteCard key={q.id} quote={q} onOpenComments={setActiveQuoteForComments} />
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
    </div>
  );
}
