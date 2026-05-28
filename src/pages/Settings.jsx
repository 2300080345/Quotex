import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Navigate } from 'react-router-dom';
import { Bell, Shield, Monitor, Sun, Moon } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container" style={{ maxWidth: '800px', padding: '4rem 1.5rem', minHeight: '70vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>Account Settings</h1>
      
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        
        {/* Appearance */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Monitor size={20} style={{ color: 'var(--text-muted)' }} /> Appearance
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Theme Preferences</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Choose between Cinematic Dark or Vintage Warm.</div>
            </div>
            <button onClick={toggleTheme} className="btn btn-outline" style={{ padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {theme === 'dark' ? <><Moon size={16}/> Dark Theme Active</> : <><Sun size={16}/> Warm Theme Active</>}
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Bell size={20} style={{ color: 'var(--text-muted)' }} /> Notifications
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Email Digests</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Receive weekly roundups of top quotes.</div>
            </div>
            <input type="checkbox" defaultChecked style={{ cursor: 'pointer', width: '18px', height: '18px' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Like Alerts</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Get notified when your quotes are liked.</div>
            </div>
            <input type="checkbox" defaultChecked style={{ cursor: 'pointer', width: '18px', height: '18px' }} />
          </div>
        </div>

        {/* Security */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield size={20} style={{ color: 'var(--text-muted)' }} /> Security
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Password</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Last changed recently.</div>
            </div>
            <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} disabled>Change Password</button>
          </div>
        </div>

      </div>
    </div>
  );
}
