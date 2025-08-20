// src/pages/ForgotPasswordPage.tsx
import { useState } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '../supabaseClient';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

// --- Using the same styles from our other auth pages for consistency ---
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
const FooterText = styled.p`
  margin-top: 1.5rem;
  text-align: center;
  color: #6b7280;
`;

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handlePasswordReset = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // This tells Supabase where to send the user after they click the link in the email
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('If an account exists for this email, a password reset link has been sent.');
    }
    setLoading(false);
  };

  return (
    <PageContainer>
      <FormContainer>
        <Title>Reset Your Password</Title>
        <Form onSubmit={handlePasswordReset}>
          <Input 
            type="email" 
            placeholder="Your email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </Form>
        {message && <Message>{message}</Message>}
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <FooterText>
          Remembered your password? <Link to="/login" style={{color: '#2563eb'}}>Sign In</Link>
        </FooterText>
      </FormContainer>
    </PageContainer>
  );
}