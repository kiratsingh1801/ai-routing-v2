// src/pages/RoutingStrategyPage.tsx
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';

const PageHeader = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 2rem;
`;

const FormContainer = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  padding: 2rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  max-width: 600px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #374151;
`;

const Input = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
`;

const Button = styled.button`
  padding: 0.75rem;
  background-color: #2563eb;
  color: white;
  font-weight: 600;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  align-self: flex-start;
  &:hover { background-color: #1d4ed8; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const Message = styled.p`
  margin-top: 1rem;
  color: #16a34a;
`;

const ErrorMessage = styled.p`
  margin-top: 1rem;
  color: #ef4444;
`;

const API_URL = 'https://ai-routing-engine.onrender.com/merchant/ai-config';

export function RoutingStrategyPage() {
  const [weights, setWeights] = useState({ success_rate_weight: 0, cost_weight: 0, speed_weight: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated.');

        const response = await fetch(API_URL, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch your AI config.');

        const data = await response.json();
        setWeights(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWeights(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage('');

    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    if (Math.abs(totalWeight - 1.0) > 0.001) {
        setError("The sum of all weights must be exactly 1.0.");
        setIsSaving(false);
        return;
    }

    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated.');

        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(weights)
        });
        if (!response.ok) throw new Error('Failed to save your AI config.');

        setSuccessMessage('Strategy saved successfully!');
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading) return <p>Loading your routing strategy...</p>;

  return (
    <div>
      <PageHeader>Routing Strategy</PageHeader>
      <FormContainer>
        <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
          Adjust the weights to prioritize different factors in the AI's routing decisions. The total of all weights must equal 1.0.
        </p>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>Success Rate Weight</Label>
            <Input type="number" step="0.01" min="0" max="1" name="success_rate_weight" value={weights.success_rate_weight} onChange={handleInputChange} />
          </InputGroup>
          <InputGroup>
            <Label>Cost Weight</Label>
            <Input type="number" step="0.01" min="0" max="1" name="cost_weight" value={weights.cost_weight} onChange={handleInputChange} />
          </InputGroup>
          <InputGroup>
            <Label>Speed Weight</Label>
            <Input type="number" step="0.01" min="0" max="1" name="speed_weight" value={weights.speed_weight} onChange={handleInputChange} />
          </InputGroup>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Strategy'}
          </Button>
          {successMessage && <Message>{successMessage}</Message>}
        </Form>
      </FormContainer>
    </div>
  );
}