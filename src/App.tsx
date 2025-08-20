import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { AuthPage } from './pages/AuthPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout } from './components/DashboardLayout';
import { OverviewPage } from './pages/OverviewPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { ApiKeysPage } from './pages/ApiKeysPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { UpdatePasswordPage } from './pages/UpdatePasswordPage';
import { AdminRoute } from './components/AdminRoute';
import { AdminLayout } from './components/AdminLayout';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { PspManagementPage } from './pages/admin/PspManagementPage';
import { AIModelControlsPage } from './pages/admin/AIModelControlsPage';

function App() {
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    // You can replace this with a more sophisticated loading spinner
    return <div>Loading Application...</div>
  }

  const ProtectedRoutes = ({ session }: { session: any }) => {
    if (!session) return <Navigate to="/login" />;
    return <DashboardLayout />;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Authentication Routes */}
        <Route path="/signup" element={<AuthPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/update-password" element={<UpdatePasswordPage />} />
        
        {/* Protected Merchant Dashboard Routes */}
        <Route element={<ProtectedRoutes session={session} />}>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/api-keys" element={<ApiKeysPage />} />
        </Route>

        {/* Protected Admin Panel Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/psps" element={<PspManagementPage />} />
            <Route path="/admin/ai-controls" element={<AIModelControlsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;