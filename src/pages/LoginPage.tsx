// src/pages/LoginPage.tsx
import { useState, FormEvent } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom'; // Import the navigation hook
import styled from 'styled-components';

// --- We can reuse the same styled components ---
const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f3f4f6;
`;
const FormContainer = styled.div`
  width: 100%;
  max-width: 28rem;
  padding: 2.5rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
`;
const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  color: #111827;
`;
const Form = styled.form`
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
const Input = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  &:focus {
    outline: 2px solid #2563eb;
    border-color: transparent;
  }
`;
const Button = styled.button`
  padding: 0.75rem;
  background-color: #2563eb;
  color: white;
  font-weight: 600;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  &:hover {
    background-color: #1d4ed8;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
const ErrorMessage = styled.p`
  margin-top: 1rem;
  text-align: center;
  color: #ef4444; /* Red for errors */
`;


export function LoginPage() {
  const navigate = useNavigate(); // Hook for programmatic navigation
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setError(error.message);
    } else {
      // If login is successful, redirect to the dashboard page
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <PageContainer>
      <FormContainer>
        <Title>Sign In</Title>
        <Form onSubmit={handleLogin}>
          <Input 
            type="email" 
            placeholder="Your email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input 
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </Form>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </FormContainer>
    </PageContainer>
  );
}