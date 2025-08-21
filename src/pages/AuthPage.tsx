// src/pages/AuthPage.tsx
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '../supabaseClient';
import styled from 'styled-components';
import { Link, useSearchParams } from 'react-router-dom';

// --- Styled components (no changes) ---
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
    &:disabled {
        background-color: #f3f4f6;
        color: #6b7280;
        cursor: not-allowed;
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

const API_BASE_URL = 'https://ai-routing-engine.onrender.com';

export function AuthPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // --- NEW: State for handling invitation token ---
    const [searchParams] = useSearchParams();
    const invitationToken = searchParams.get('invitation_token');
    const [isVerifying, setIsVerifying] = useState(!!invitationToken);
    const [tokenError, setTokenError] = useState('');


    useEffect(() => {
        if (!invitationToken) {
            return;
        }

        const verifyToken = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/verify-invitation`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: invitationToken })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Invalid invitation link.');
                }

                const data = await response.json();
                setEmail(data.email); // Pre-fill email from the valid token

            } catch (err: any) {
                setTokenError(`Error: ${err.message} Please ask for a new invitation.`);
            } finally {
                setIsVerifying(false);
            }
        };

        verifyToken();
    }, [invitationToken]);


    const handleSignUp = async (event: FormEvent) => {
        event.preventDefault();
        setMessage('');
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: { data: { full_name: name } }
        });

        if (error) {
            setError(error.message);
        } else {
            setMessage('Success! Please check your email for a confirmation link.');
        }
        setLoading(false);
    };

    if (isVerifying) {
        return (
            <PageContainer>
                <p>Verifying invitation...</p>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <FormContainer>
                <Title>{invitationToken ? 'Complete Your Invitation' : 'Create an Account'}</Title>

                {tokenError ? (
                    <ErrorMessage>{tokenError}</ErrorMessage>
                ) : (
                    <Form onSubmit={handleSignUp}>
                        <Input
                            type="text"
                            placeholder="Your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <Input
                            type="email"
                            placeholder="Your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={!!invitationToken}
                            readOnly={!!invitationToken}
                        />
                        <Input
                            type="password"
                            placeholder="Your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Input
                            type="password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </Form>
                )}

                {message && <Message>{message}</Message>}
                {error && <ErrorMessage>{error}</ErrorMessage>}

                <FooterText>
                    Already have an account? <Link to="/login" style={{color: '#2563eb'}}>Sign In</Link>
                </FooterText>
            </FormContainer>
        </PageContainer>
    );
}