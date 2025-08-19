// src/pages/TransactionsPage.tsx
import { useState, useEffect } from 'react';
import styled from 'styled-components';

const PageHeader = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 2rem;
`;

const TableContainer = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
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
  white-space: nowrap;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: white;
  color: #374151;
  font-weight: 500;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
  &:hover {
    background-color: #f9fafb;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const API_URL = 'https://ai-routing-engine.onrender.com/transactions';

export function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}?page=${currentPage}&page_size=${pageSize}`);
        if (!response.ok) throw new Error('Failed to fetch transactions.');

        const data = await response.json();
        setTransactions(data.transactions);
        setTotalCount(data.total_count);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [currentPage]); // Re-fetch transactions whenever the currentPage changes

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div>
      <PageHeader>Transactions</PageHeader>
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Amount</Th>
              <Th>Currency</Th>
              <Th>Country</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><Td colSpan={5}>Loading...</Td></tr>
            ) : error ? (
              <tr><Td colSpan={5} style={{ color: 'red' }}>{error}</Td></tr>
            ) : (
              transactions.map((tx: any) => (
                <tr key={tx.id}>
                  <Td>{new Date(tx.created_at).toLocaleString()}</Td>
                  <Td>{tx.amount.toFixed(2)}</Td>
                  <Td>{tx.currency}</Td>
                  <Td>{tx.geo}</Td>
                  <Td>{tx.status || 'N/A'}</Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </TableContainer>
      <PaginationContainer>
        <Button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
          Previous
        </Button>
        <span>Page {currentPage} of {totalPages}</span>
        <Button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>
          Next
        </Button>
      </PaginationContainer>
    </div>
  );
}