// src/pages/DashboardPage.tsx
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { TransactionForm } from '../components/TransactionForm';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  max-width: 42rem;
  margin: 4rem auto;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const WelcomeText = styled.p`
  color: #4b5563;
`;

const LogoutButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #ef4444;
  color: white;
  font-weight: 500;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  &:hover {
    background-color: #dc2626;
  }
`;

export function DashboardPage({ userEmail }: { userEmail: string }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <DashboardContainer>
      <Header>
        <WelcomeText>Welcome, <strong>{userEmail}</strong></WelcomeText>
        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      </Header>
      <TransactionForm />
    </DashboardContainer>
  );
}