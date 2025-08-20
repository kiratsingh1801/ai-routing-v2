// src/pages/UpdatePasswordPage.tsx
import { useState } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// --- Reusing styles from our other auth pages ---
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
  &:hover { background-color: #1d4ed8; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
const Message = styled.p`
  margin-top: 1rem;
  text-align: center;
  color: #16a34a;
`;
const ErrorMessage = styled.p`
  margin-top: 1rem;
  text-align: center;
  color: #ef4444;
`;

export function UpdatePasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdatePassword = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: password });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Your password has been updated successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
    setLoading(false);
  };

  return (
    <PageContainer>
      <FormContainer>
        <Title>Set Your New Password</Title>
        <Form onSubmit={handleUpdatePassword}>
          <Input 
            type="password"
            placeholder="Enter your new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input 
            type="password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </Form>
        {message && <Message>{message}</Message>}
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </FormContainer>
    </PageContainer>
  );
}