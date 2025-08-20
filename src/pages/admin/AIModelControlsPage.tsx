import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../supabaseClient';

// --- API Helper ---
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const authenticatedFetch = async (path: string, options: RequestInit = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        throw new Error("User is not authenticated.");
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        ...options.headers,
    };

    const response = await fetch(`${apiBaseUrl}/${path}`, { ...options, headers });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'An unknown error occurred' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

// --- Styled Components ---
const PageHeader = styled.h1`
  color: #333;
  font-size: 28px;
  margin-bottom: 20px;
`;

const ErrorMessage = styled.div`
    color: #dc3545;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    padding: 15px;
    border-radius: 6px;
    margin-bottom: 20px;
`;

export const AIModelControlsPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchConfig = async () => {
            setIsLoading(true);
            setError('');
            try {
                // MODIFIED: Calling the new test endpoint for debugging
                const data = await authenticatedFetch('admin/test-debug');
                
                // ADDED: Logging the response to the browser console
                console.log("DEBUG RESPONSE:", data); 

            } catch (err: any) {
                setError(err.message || 'Failed to fetch config.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchConfig();
    }, []);

    if (isLoading) return <div>Running test...</div>;

    return (
        <div>
            <PageHeader>AI Model Controls (Debug Mode)</PageHeader>
            
            {error && <ErrorMessage>Error: {error}</ErrorMessage>}
            
            {!error && !isLoading && (
                 <div style={{ padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '8px' }}>
                    <p style={{ fontWeight: 'bold' }}>Test request sent.</p>
                    <p>Please open the browser's developer console (Right-click → Inspect → Console) to see the debug response.</p>
                </div>
            )}
        </div>
    );
};