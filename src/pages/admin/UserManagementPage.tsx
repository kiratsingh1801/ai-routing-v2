// src/pages/admin/UserManagementPage.tsx
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../supabaseClient';

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
  font-size: 0.875rem;
`;

const API_URL = 'https://ai-routing-engine.onrender.com/admin/users';

export function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated.');

        const response = await fetch(API_URL, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to fetch users.');
        }

        const data = await response.json();
        setUsers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <PageHeader>User Management</PageHeader>
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>Email</Th>
              <Th>User ID</Th>
              <Th>Last Sign In</Th>
              <Th>Date Joined</Th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><Td colSpan={4}>Loading users...</Td></tr>
            ) : error ? (
              <tr><Td colSpan={4} style={{ color: 'red' }}>{error}</Td></tr>
            ) : (
              users.map((user: any) => (
                <tr key={user.id}>
                  <Td>{user.email}</Td>
                  <Td>{user.id}</Td>
                  <Td>{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}</Td>
                  <Td>{new Date(user.created_at).toLocaleString()}</Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </TableContainer>
    </div>
  );
}