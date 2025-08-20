// src/components/TransactionForm.tsx
import { useState } from 'react';
import type { FormEvent } from 'react';
import styled from 'styled-components';
import { ResultsDisplay } from './ResultsDisplay';
import { supabase } from '../supabaseClient';

// This interface defines the shape of the data we expect back from the API
interface RankedPsp {
  rank: number;
  psp_id: string;
  psp_name: string;
  score: number;
  reason: string;
}

// --- Styled Components ---
const FormContainer = styled.div`
  margin-top: 2rem;
  padding: 2rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
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

const SubmitButton = styled.button`
  grid-column: span 2 / span 2;
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

const API_URL = 'https://ai-routing-engine.onrender.com/route-transaction';

export function TransactionForm() {
  // State for form inputs
  const [amount, setAmount] = useState('100.00');
  const [currency, setCurrency] = useState('USD');
  const [country, setCountry] = useState('US');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  // State for API response
  const [rankedPsps, setRankedPsps] = useState<RankedPsp[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setRankedPsps([]);

    const transactionData = {
      transaction_id: crypto.randomUUID(),
      amount: parseFloat(amount),
      currency,
      geo: country,
      payment_method: paymentMethod,
    };

    try {
      // Get the current user's session token to authenticate the request
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You are not logged in. Please log in again.');
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add the Authorization header with the user's token
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        // Try to get a more specific error message from the backend
        const errorBody = await response.json().catch(() => ({ detail: `API Error: ${response.statusText}` }));
        throw new Error(errorBody.detail || `API Error: ${response.status}`);
      }

      const data = await response.json();
      setRankedPsps(data.ranked_psps);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <FormContainer>
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </InputGroup>
          <InputGroup>
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" type="text" value={currency} onChange={(e) => setCurrency(e.target.value)} />
          </InputGroup>
          <InputGroup>
            <Label htmlFor="country">Country</Label>
            <Input id="country" type="text" value={country} onChange={(e) => setCountry(e.target.value)} />
          </InputGroup>
          <InputGroup>
            <Label htmlFor="payment_method">Payment Method</Label>
            <Input id="payment_method" type="text" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} />
          </InputGroup>
          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? 'Routing...' : 'Route Transaction'}
          </Button>
        </Form>
      </FormContainer>

      {/* The ResultsDisplay component will show the loading state, errors, or results */}
      <ResultsDisplay rankedPsps={rankedPsps} isLoading={isLoading} error={error} />
    </>
  );
}
