// src/components/AdminRoute.tsx
import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import type { Session } from '@supabase/supabase-js'; // CORRECTED

export function AdminRoute() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        // If the user is logged in, check their profile for the admin role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile && profile.role === 'admin') {
          setIsAdmin(true);
        }
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show a loading message while we check
  }

  if (!session) {
    // If no session, redirect to login
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    // If they are not an admin, redirect to the merchant dashboard
    return <Navigate to="/" />;
  }

  // If they are a logged-in admin, show the admin layout and its nested pages
  return <Outlet />;
}