import { useState, useEffect } from 'react';
import { AuthContext } from './auth-context';
import { supabase } from '../lib/supabase';
function handleSession(session) {
  if (session) {
    const u = {
      id: session.user.id,
      email: session.user.email || '',
      name: session.user.user_metadata?.name || 'User',
    };
    return { user: u, token: session.access_token };
  }
  return { user: null, token: null };
}
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const { user: u, token: t } = handleSession(session);
      setUser(u);
      setToken(t);
      if (t) {
        localStorage.setItem('token', t);
        if (u) localStorage.setItem('user', JSON.stringify(u));
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      setLoading(false);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  const setAuth = (nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem('user', JSON.stringify(nextUser));
    localStorage.setItem('token', nextToken);
  };
  const logout = async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    await supabase.auth.signOut();
  };
  const value = { user, token, setAuth, logout };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="h-10 w-10 animate-spin rounded-full border-[4px] border-black border-t-transparent dark:border-white dark:border-t-transparent" />
      </div>
    );
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
