import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border-color)', padding: '4rem 1.5rem', background: 'var(--bg-secondary)', marginTop: '4rem' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Have a masterpiece in mind?</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '400px' }}>
          Join the community of wordsmiths. Submit your quote and compete for the Quote of the Month.
        </p>
        
        <Link to="/write" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', marginBottom: '4rem', boxShadow: '0 0 20px rgba(255,255,255,0.1)', textDecoration: 'none' }}>
          Submit Your Quote
        </Link>

        <div className="footer-flex" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.05em' }}>
            QUOTEX<span style={{ color: 'var(--text-muted)' }}>.</span>
          </div>
          
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <a href="#" className="hover:text-white">About</a>
            <a href="#" className="hover:text-white">Guidelines</a>
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            &copy; 2026 Quotex. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
