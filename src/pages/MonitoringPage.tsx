// src/pages/MonitoringPage.tsx
import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';
import { Eye } from 'lucide-react';

// --- Type Definitions ---
interface Transaction {
    id: string;
    created_at: string;
    amount: number;
    currency: string;
    geo: string;
    status: string | null;
}

interface FilterData {
    psps: string[];
    countries: string[];
    currencies: string[];
    statuses: string[];
}

// --- Styled Components ---
const PageHeader = styled.h1`
    font-size: 1.875rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 2rem;
`;

const FiltersContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    padding: 1.5rem;
    background-color: white;
    border-radius: 0.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
`;

const FilterGroup = styled.div`
    display: flex;
    flex-direction: column;
`;

const FilterLabel = styled.label`
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
`;

const Select = styled.select`
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    background-color: white;
`;

const TableContainer = styled.div`
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    overflow-x: auto;
`;

const Table = styled.table`
    width: 100%;
    text-align: left;
    border-collapse: collapse;
`;

const Th = styled.th`
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    background-color: #f9fafb;
    font-weight: 600;
`;

const Td = styled.td`
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    font-size: 0.875rem;
`;

const ActionButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    color: #6b7280;
    &:hover { color: #2563eb; }
`;

const API_BASE_URL = 'https://ai-routing-engine.onrender.com';

export function MonitoringPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filterData, setFilterData] = useState<FilterData | null>(null);
    const [filters, setFilters] = useState({ psp: '', country: '', currency: '', status: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch initial data (last 50 transactions and filter options)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) throw new Error('Not authenticated.');

                // Fetch filter options
                const filterResponse = await fetch(`${API_BASE_URL}/transactions/filter-data`, {
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                });
                if (!filterResponse.ok) throw new Error('Failed to fetch filter data.');
                const filters = await filterResponse.json();
                setFilterData(filters);

                // Fetch initial transactions
                const { data: initialTransactions, error: txError } = await supabase
                    .from('transactions')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (txError) throw txError;
                setTransactions(initialTransactions || []);

            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Set up real-time subscription
    useEffect(() => {
        const channel = supabase.channel('realtime-transactions')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'transactions'
            }, (payload) => {
                setTransactions(currentTransactions => [payload.new as Transaction, ...currentTransactions]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    
    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            return (filters.country ? tx.geo === filters.country : true) &&
                   (filters.currency ? tx.currency === filters.currency : true) &&
                   (filters.status ? tx.status === filters.status : true);
            // Note: PSP filtering would require a join, which is more complex for real-time.
            // For this version, we'll filter by the available columns.
        });
    }, [transactions, filters]);

    if (isLoading) return <p>Loading transaction data...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

    return (
        <div>
            <PageHeader>Real-time Transaction Monitoring</PageHeader>

            <FiltersContainer>
                <FilterGroup>
                    <FilterLabel>Country</FilterLabel>
                    <Select name="country" value={filters.country} onChange={handleFilterChange}>
                        <option value="">All</option>
                        {filterData?.countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </Select>
                </FilterGroup>
                <FilterGroup>
                    <FilterLabel>Currency</FilterLabel>
                    <Select name="currency" value={filters.currency} onChange={handleFilterChange}>
                        <option value="">All</option>
                        {filterData?.currencies.map(c => <option key={c} value={c}>{c}</option>)}
                    </Select>
                </FilterGroup>
                <FilterGroup>
                    <FilterLabel>Status</FilterLabel>
                    <Select name="status" value={filters.status} onChange={handleFilterChange}>
                        <option value="">All</option>
                        {filterData?.statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                </FilterGroup>
            </FiltersContainer>

            <TableContainer>
                <Table>
                    <thead>
                        <tr>
                            <Th>Time</Th>
                            <Th>Amount</Th>
                            <Th>Currency</Th>
                            <Th>Country</Th>
                            <Th>Status</Th>
                            <Th>Actions</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.map((tx) => (
                            <tr key={tx.id}>
                                <Td>{new Date(tx.created_at).toLocaleTimeString()}</Td>
                                <Td>{tx.amount.toFixed(2)}</Td>
                                <Td>{tx.currency}</Td>
                                <Td>{tx.geo}</Td>
                                <Td>{tx.status || 'N/A'}</Td>
                                <Td>
                                    <ActionButton title="View Details">
                                        <Eye size={18} />
                                    </ActionButton>
                                </Td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </TableContainer>
        </div>
    );
}
