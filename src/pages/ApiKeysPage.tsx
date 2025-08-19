// src/pages/ApiKeysPage.tsx
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';
import { Copy, RefreshCw } from 'lucide-react';

const PageHeader = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 2rem;
`;

const Container = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  padding: 2rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
`;

const KeyDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f9fafb;
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
`;

const KeyText = styled.code`
  font-family: monospace;
  color: #374151;
  word-break: break-all;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #2563eb;
  color: white;
  font-weight: 500;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  &:hover { background-color: #1d4ed8; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const API_BASE_URL = 'https://ai-routing-engine.onrender.com';

export function ApiKeysPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState('');

  // We moved the logic to a single function for reusability
  const makeAuthenticatedRequest = async (endpoint: string, options: RequestInit = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Your session has expired. Please log out and log in again.');
    }

    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${session.access_token}`);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'An unknown error occurred.' }));
      throw new Error(errorData.detail || 'Failed to complete the request.');
    }
    return response.json();
  };

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const data = await makeAuthenticatedRequest('/api-key');
        setApiKey(data.api_key);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApiKey();
  }, []);

  const handleGenerateKey = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const data = await makeAuthenticatedRequest('/api-key/generate', { method: 'POST' });
      setApiKey(data.api_key);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  if (isLoading) return <p>Loading API Key...</p>;

  return (
    <div>
      <PageHeader>API Keys</PageHeader>
      {error && <p style={{color: 'red', marginBottom: '1rem'}}>Error: {error}</p>}
      <Container>
        {apiKey ? (
          <>
            <p style={{marginBottom: '1rem', color: '#4b5563'}}>Your API key is shown below. Keep it secure.</p>
            <KeyDisplay>
              <KeyText>{apiKey}</KeyText>
              <Button onClick={handleCopy} style={{backgroundColor: '#16a34a'}}>
                <Copy size={16} /> {copySuccess || 'Copy'}
              </Button>
            </KeyDisplay>
            <Button onClick={handleGenerateKey} disabled={isGenerating} style={{marginTop: '1.5rem'}}>
              <RefreshCw size={16} /> {isGenerating ? 'Generating...' : 'Generate New Key'}
            </Button>
          </>
        ) : (
          <>
            <p style={{marginBottom: '1rem', color: '#4b5563'}}>You don't have an API key yet.</p>
            <Button onClick={handleGenerateKey} disabled={isGenerating}>
              {isGenerating ? 'Generating...' : 'Generate Your First Key'}
            </Button>
          </>
        )}
      </Container>
    </div>
  );
}