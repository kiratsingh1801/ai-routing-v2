// src/pages/PspHealthPage.tsx
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';
import { RefreshCw } from 'lucide-react';

// --- Type Definitions ---
interface PspHealth {
    id: string;
    name: string;
    is_active: boolean;
    last_health_check: string | null;
    uptime_percentage_24h: number | null;
}

// --- Styled Components ---
const PageHeader = styled.h1`
    font-size: 1.875rem;
    font-weight: 700;
    color: #111827;
`;

const HeaderContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
`;

const Button = styled.button`
    padding: 0.6rem 1.5rem;
    background-color: #2563eb;
    color: white;
    font-weight: 600;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    &:hover { background-color: #1d4ed8; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
`;

const Card = styled.div`
    background-color: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    border-left: 4px solid;
    border-color: ${props => props.color || '#e5e7eb'};
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
`;

const PspName = styled.h2`
    font-size: 1.25rem;
    font-weight: 600;
`;

const StatusIndicator = styled.div<{ $isOperational: boolean }>`
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: ${props => props.$isOperational ? '#22c55e' : '#ef4444'};
`;

const Uptime = styled.p`
    font-size: 2rem;
    font-weight: 700;
    color: #111827;
`;

const LastChecked = styled.p`
    font-size: 0.875rem;
    color: #6b7280;
    margin-top: 0.5rem;
`;

const API_BASE_URL = 'https://ai-routing-engine.onrender.com';

export function PspHealthPage() {
    const [healthData, setHealthData] = useState<PspHealth[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    const fetchHealthData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/psps/health`);
            if (!response.ok) throw new Error('Failed to fetch PSP health data.');
            const data = await response.json();
            setHealthData(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const checkAdminStatus = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();
                if (profile && profile.role === 'admin') {
                    setIsAdmin(true);
                }
            }
        };
        checkAdminStatus();
        fetchHealthData();
    }, []);

    const handleRunChecks = async () => {
        setIsChecking(true);
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated.');
            const response = await fetch(`${API_BASE_URL}/admin/psps/run-health-checks`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (!response.ok) throw new Error('Failed to trigger health checks.');
            await fetchHealthData(); // Refresh data after checks are run
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsChecking(false);
        }
    };

    const getStatusColor = (uptime: number | null) => {
        if (uptime === null || uptime >= 99) return '#22c55e'; // Green
        if (uptime >= 95) return '#f59e0b'; // Amber
        return '#ef4444'; // Red
    };

    return (
        <div>
            <HeaderContainer>
                <PageHeader>PSP Health Status</PageHeader>
                {isAdmin && (
                    <Button onClick={handleRunChecks} disabled={isChecking}>
                        <RefreshCw size={16} className={isChecking ? 'animate-spin' : ''} />
                        {isChecking ? 'Running Checks...' : 'Run Health Checks'}
                    </Button>
                )}
            </HeaderContainer>
            
            {error && <p style={{color: 'red'}}>Error: {error}</p>}

            <Grid>
                {isLoading ? <p>Loading health data...</p> : healthData.map(psp => (
                    <Card key={psp.id} color={getStatusColor(psp.uptime_percentage_24h)}>
                        <CardHeader>
                            <PspName>{psp.name}</PspName>
                            <StatusIndicator $isOperational={psp.is_active && (psp.uptime_percentage_24h ?? 100) > 95} />
                        </CardHeader>
                        <Uptime>{psp.uptime_percentage_24h !== null ? `${psp.uptime_percentage_24h.toFixed(2)}%` : 'N/A'}</Uptime>
                        <LastChecked>
                            Uptime (24h) - Last checked: {psp.last_health_check ? new Date(psp.last_health_check).toLocaleString() : 'Never'}
                        </LastChecked>
                    </Card>
                ))}
            </Grid>
        </div>
    );
}
