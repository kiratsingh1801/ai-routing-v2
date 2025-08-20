// src/components/AdminRoute.tsx
import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import type { Session } from '@supabase/supabase-js';

export function AdminRoute() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        // Check the user's profile for the admin role
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        // --- NEW DEBUG LINE ---
        console.log('Admin Check Result:', { profile, error });
        // --------------------

        if (profile && profile.role === 'admin') {
          setIsAdmin(true);
        }
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    // You are being redirected because isAdmin is false
    return <Navigate to="/" />;
  }

  return <Outlet />;
}