// src/App.tsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { AuthPage } from './pages/AuthPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout } from './components/DashboardLayout';
import { OverviewPage } from './pages/OverviewPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { ApiKeysPage } from './pages/ApiKeysPage'; // Import the real ApiKeysPage

function ProtectedRoutes({ session }: { session: any }) {
  if (!session) {
    return <Navigate to="/login" />;
  }
  return <DashboardLayout />;
}

function App() {
  const [session, setSession] = useState<any | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<AuthPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<ProtectedRoutes session={session} />}>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/api-keys" element={<ApiKeysPage />} /> {/* Use the real page */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;