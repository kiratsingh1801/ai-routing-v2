// src/pages/AuthPage.tsx
import { useState } from 'react'; // CORRECTED
import type { FormEvent } from 'react'; // CORRECTED
import { supabase } from '../supabaseClient';
import styled from 'styled-components';

// ... (rest of the file is the same)
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
const Message = styled.p`
  margin-top: 1rem;
  text-align: center;
  color: #16a34a; /* Green for success */
`;
const ErrorMessage = styled.p`
  margin-top: 1rem;
  text-align: center;
  color: #ef4444; /* Red for errors */
`;
export function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const handleSignUp = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    if (error) {
      setError(error.message);
    } else {
      setMessage('Success! You can now log in.');
    }
    setLoading(false);
  };
  return (
    <PageContainer>
      <FormContainer>
        <Title>Create an Account</Title>
        <Form onSubmit={handleSignUp}>
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
            {loading ? 'Signing Up...' : 'Sign Up'}
          </Button>
        </Form>
        {message && <Message>{message}</Message>}
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </FormContainer>
    </PageContainer>
  );
}