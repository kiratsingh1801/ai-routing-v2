// src/pages/MonitoringPage.tsx
import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';
import { Eye, X } from 'lucide-react';

// --- Type Definitions ---
interface Transaction {
    id: string;
    created_at: string;
    amount: number;
    currency: string;
    geo: string;
    status: string | null;
}

interface DetailedTransaction extends Transaction {
    payment_method: string | null;
    routed_psp_name: string | null;
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

// --- Modal Styles ---
const ModalBackdrop = styled.div`
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background-color: rgba(0,0,0,0.5);
    display: flex; justify-content: center; align-items: center; z-index: 1000;
`;

const ModalContent = styled.div`
    background-color: white;
    border-radius: 0.5rem;
    width: 90%;
    max-width: 600px;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
`;

const ModalTitle = styled.h2`
    font-size: 1.25rem;
    font-weight: 600;
`;

const ModalBody = styled.div`
    padding: 1.5rem;
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 1rem;
`;

const DetailLabel = styled.span`
    font-weight: 500;
    color: #4b5563;
`;

const DetailValue = styled.span`
    color: #111827;
    word-break: break-all;
`;


const API_BASE_URL = 'https://ai-routing-engine.onrender.com';

export function MonitoringPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filterData, setFilterData] = useState<FilterData | null>(null);
    const [filters, setFilters] = useState({ psp: '', country: '', currency: '', status: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTx, setSelectedTx] = useState<DetailedTransaction | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) throw new Error('Not authenticated.');

                const filterResponse = await fetch(`${API_BASE_URL}/transactions/filter-data`, {
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                });
                if (!filterResponse.ok) throw new Error('Failed to fetch filter data.');
                const filters = await filterResponse.json();
                setFilterData(filters);

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
        });
    }, [transactions, filters]);

    const handleViewDetails = async (transactionId: string) => {
        setIsModalOpen(true);
        setIsLoadingDetails(true);
        setDetailError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Authentication expired.');

            const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to fetch transaction details.');
            }
            const data = await response.json();
            setSelectedTx(data);
        } catch (err: any) {
            setDetailError(err.message);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    if (isLoading) return <p>Loading transaction data...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

    return (
        <div>
            <PageHeader>Real-time Transaction Monitoring</PageHeader>
            
            {/* CORRECTED: Added the filter UI back in */}
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
                            <Th>Time</Th><Th>Amount</Th><Th>Currency</Th><Th>Country</Th><Th>Status</Th><Th>Actions</Th>
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
                                    <ActionButton onClick={() => handleViewDetails(tx.id)} title="View Details">
                                        <Eye size={18} />
                                    </ActionButton>
                                </Td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </TableContainer>

            {isModalOpen && (
                <ModalBackdrop>
                    <ModalContent>
                        <ModalHeader>
                            <ModalTitle>Transaction Details</ModalTitle>
                            <ActionButton onClick={() => setIsModalOpen(false)}><X size={24} /></ActionButton>
                        </ModalHeader>
                        <ModalBody>
                            {isLoadingDetails ? <p>Loading details...</p> :
                             detailError ? <p style={{color: 'red'}}>{detailError}</p> :
                             selectedTx && (
                                <>
                                    <DetailLabel>Transaction ID</DetailLabel><DetailValue>{selectedTx.id}</DetailValue>
                                    <DetailLabel>Timestamp</DetailLabel><DetailValue>{new Date(selectedTx.created_at).toLocaleString()}</DetailValue>
                                    <DetailLabel>Amount</DetailLabel><DetailValue>{selectedTx.amount.toFixed(2)} {selectedTx.currency}</DetailValue>
                                    <DetailLabel>Country</DetailLabel><DetailValue>{selectedTx.geo}</DetailValue>
                                    <DetailLabel>Payment Method</DetailLabel><DetailValue>{selectedTx.payment_method || 'N/A'}</DetailValue>
                                    <DetailLabel>Status</DetailLabel><DetailValue>{selectedTx.status || 'N/A'}</DetailValue>
                                    <DetailLabel>Routed PSP</DetailLabel><DetailValue>{selectedTx.routed_psp_name || 'N/A'}</DetailValue>
                                </>
                             )
                            }
                        </ModalBody>
                    </ModalContent>
                </ModalBackdrop>
            )}
        </div>
    );
}
