import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await syncUserWithBackend(session.access_token);
      } else {
        setLoading(false);
      }
    };
    checkSession();

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && event === 'SIGNED_IN') {
        await syncUserWithBackend(session.access_token);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('quotex_token');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncUserWithBackend = async (token) => {
    try {
      localStorage.setItem('quotex_token', token);
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/auth/sync', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (e) {
      console.error('Sync error:', e);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
