import React, { useState, useRef } from 'react';
import { Heart, MessageCircle, Share2, Maximize2, X, Crown, Star, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import html2canvas from 'html2canvas';

export default function QuoteCard({ quote, onOpenComments }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(quote.likes);
  const [isLiked, setIsLiked] = useState(quote.isLiked);
  const [isZenMode, setIsZenMode] = useState(false);
  const zenRef = useRef(null);

  // Determine Badge
  let Badge = null;
  let badgeColor = '';
  if (quote.userTotalLikes >= 100) { Badge = Crown; badgeColor = '#fbbf24'; } // Gold Crown
  else if (quote.userTotalLikes >= 10) { Badge = Star; badgeColor = '#a1a1aa'; } // Silver Star

  const handleLike = async () => {
    if (!user) return alert('Please log in to like quotes.');
    
    // Optimistic update
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);

    try {
      const token = localStorage.getItem('quotex_token');
      await fetch(`${import.meta.env.VITE_API_URL}/api/quotes/${quote.id}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
      // Revert on error
      setIsLiked(isLiked);
      setLikes(quote.likes);
    }
  };

  const handleShare = () => {
    const shareText = `"${quote.text}" — ${quote.authorName || 'Anonymous'}`;
    if (navigator.share) {
      navigator.share({
        title: 'Quotex',
        text: shareText,
        url: window.location.href,
      }).catch(err => console.error(err));
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Quote copied to clipboard!');
    }
  };

  const handleExport = async () => {
    if (!zenRef.current) return;
    try {
      const canvas = await html2canvas(zenRef.current, {
        backgroundColor: '#09090b', // Match dark theme
        scale: 2
      });
      const link = document.createElement('a');
      link.download = `quotex-${quote.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Export failed", err);
      alert('Failed to export image.');
    }
  };

  return (
    <>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-gold)', marginBottom: '1rem' }}>
              {quote.category}
            </div>
            <button onClick={() => setIsZenMode(true)} style={{ color: 'var(--text-muted)', opacity: 0.5 }} className="hover:text-white hover:opacity-100">
              <Maximize2 size={16} />
            </button>
          </div>
          <p className="quote-font" style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '1.5rem', lineHeight: 1.6 }}>"{quote.text}"</p>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            — {quote.authorName || 'Anonymous'}
            {Badge && <Badge size={14} color={badgeColor} fill={badgeColor} style={{ filter: `drop-shadow(0 0 5px ${badgeColor})` }} />}
          </span>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: isLiked ? '#ef4444' : 'var(--text-muted)', transition: 'color 0.2s' }}>
              <Heart size={16} fill={isLiked ? '#ef4444' : 'none'} /> {likes}
            </button>
            <button onClick={() => onOpenComments(quote)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }} className="hover:text-white">
              <MessageCircle size={16} /> {quote.commentCount || 0}
            </button>
            <button onClick={handleShare} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }} className="hover:text-white">
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {isZenMode && (
        <div className="zen-mode-overlay">
          <div style={{ position: 'absolute', top: '2rem', right: '2rem', display: 'flex', gap: '1rem' }}>
            <button onClick={handleExport} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '20px' }} className="hover:text-white">
              <Download size={18} /> Export IG Story
            </button>
            <button onClick={() => setIsZenMode(false)} style={{ color: 'var(--text-muted)' }} className="hover:text-white">
              <X size={32} />
            </button>
          </div>
          <div className="zen-mode-content" ref={zenRef} style={{ padding: '4rem 2rem', borderRadius: '16px', background: 'var(--bg-main)', backgroundImage: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.1) 0%, transparent 70%)' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-gold)', marginBottom: '2rem', letterSpacing: '0.2em' }}>
              {quote.category}
            </div>
            <p className="quote-font" style={{ fontSize: '3rem', fontWeight: 600, marginBottom: '3rem', lineHeight: 1.4, color: 'var(--text-main)', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
              "{quote.text}"
            </p>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontStyle: 'italic', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              — {quote.authorName || 'Anonymous'}
              {Badge && <Badge size={18} color={badgeColor} fill={badgeColor} style={{ filter: `drop-shadow(0 0 10px ${badgeColor})` }} />}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
