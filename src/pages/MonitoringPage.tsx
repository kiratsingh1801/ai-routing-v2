// src/pages/MonitoringPage.tsx
import { useState } from 'react';
import styled from 'styled-components';

const PageHeader = styled.h1`
    font-size: 1.875rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 2rem;
`;

const PlaceholderText = styled.p`
    color: #6b7280;
    font-style: italic;
    text-align: center;
    margin-top: 4rem;
`;

export function MonitoringPage() {
    const [error] = useState<string | null>(null);

    // We will add the real-time logic and state here in the next step.

    return (
        <div>
            <PageHeader>Real-time Transaction Monitoring</PageHeader>
            {/* We will build the filter components here */}
            
            {error ? (
                <p style={{ color: 'red' }}>Error: {error}</p>
            ) : (
                <PlaceholderText>
                    Connecting to real-time transaction feed...
                </PlaceholderText>
            )}

            {/* We will build the real-time transaction feed table here */}
        </div>
    );
}
