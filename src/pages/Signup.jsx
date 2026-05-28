import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, KeyRound } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });
      if (error) throw error;
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });
      if (error) throw error;
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', background: 'rgba(24, 24, 27, 0.7)', backdropFilter: 'blur(10px)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '50%', marginBottom: '1rem' }}>
            {step === 1 ? <UserPlus size={24} style={{ color: 'var(--accent-purple)' }} /> : <KeyRound size={24} style={{ color: 'var(--accent-purple)' }} />}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{step === 1 ? 'Join Quotex' : 'Verify Email'}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {step === 1 ? 'Create an account to start submitting quotes' : `We sent an OTP to ${email}.`}
          </p>
        </div>

        {error && <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white' }} placeholder="writer@quotex.com" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', background: 'var(--accent-purple)', color: 'white', border: 'none' }}>Continue with Email</button>
          </form>
        ) : (
          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>6-Digit OTP</label>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6} style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '1.5rem', letterSpacing: '0.5em', textAlign: 'center' }} placeholder="000000" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}>Verify & Log In</button>
            <button type="button" onClick={() => setStep(1)} className="btn btn-outline" style={{ width: '100%', padding: '0.85rem' }}>Go Back</button>
          </form>
        )}

        {step === 1 && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Log in</Link>
          </div>
        )}
      </div>
    </div>
  );
}
