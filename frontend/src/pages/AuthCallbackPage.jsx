import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
export function AuthCallbackPage() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard', { replace: true });
      }
    });
  }, [navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <div className="h-10 w-10 animate-spin rounded-full border-[4px] border-black border-t-transparent dark:border-white dark:border-t-transparent" />
    </div>
  );
}
