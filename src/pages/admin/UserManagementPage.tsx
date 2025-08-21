// src/pages/admin/UserManagementPage.tsx
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import styled from 'styled-components';
import { supabase } from '../../supabaseClient';
import { PlusCircle } from 'lucide-react';

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

const SecondaryButton = styled(Button)`
    background-color: white;
    color: #374151;
    border: 1px solid #d1d5db;
    &:hover { background-color: #f9fafb; }
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
    max-width: 500px;
`;

const ModalHeader = styled.h2`
    padding: 1.5rem 2rem;
    font-size: 1.25rem;
    font-weight: 600;
    border-bottom: 1px solid #e5e7eb;
`;

const Form = styled.form`
    padding: 2rem;
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
`;

const Input = styled.input`
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
`;

const Select = styled.select`
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    background-color: white;
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1rem 2rem;
    border-top: 1px solid #e5e7eb;
    background-color: #f9fafb;
`;

const ErrorMessage = styled.p`
    color: #ef4444;
    font-size: 0.875rem;
`;

const SuccessMessage = styled.p`
    color: #16a34a;
    font-size: 0.875rem;
`;


const API_BASE_URL = 'https://ai-routing-engine.onrender.com/admin';

export function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- NEW: State for invitation modal ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [inviteError, setInviteError] = useState('');
    const [inviteSuccess, setInviteSuccess] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('merchant');


    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) throw new Error('Not authenticated.');

                const response = await fetch(`${API_BASE_URL}/users`, {
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
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

    const handleInviteSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setIsInviting(true);
        setInviteError('');
        setInviteSuccess('');

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Authentication session expired.');

            const response = await fetch(`${API_BASE_URL}/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to send invitation.');
            }

            setInviteSuccess(`Invitation sent successfully to ${inviteEmail}!`);
            setInviteEmail(''); // Clear email field on success
            setTimeout(() => {
                setIsModalOpen(false);
                setInviteSuccess('');
            }, 2000);

        } catch (err: any) {
            setInviteError(err.message);
        } finally {
            setIsInviting(false);
        }
    };

    return (
        <div>
            <HeaderContainer>
                <PageHeader>User Management</PageHeader>
                <Button onClick={() => setIsModalOpen(true)}>
                    <PlusCircle size={16} /> Invite User
                </Button>
            </HeaderContainer>

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

            {isModalOpen && (
                <ModalBackdrop>
                    <ModalContent>
                        <ModalHeader>Invite New User</ModalHeader>
                        <Form onSubmit={handleInviteSubmit}>
                            <InputGroup>
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="new.user@example.com"
                                    required
                                />
                            </InputGroup>
                            <InputGroup>
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    id="role"
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value)}
                                >
                                    <option value="merchant">Merchant</option>
                                    <option value="admin">Admin</option>
                                </Select>
                            </InputGroup>
                            {inviteError && <ErrorMessage>{inviteError}</ErrorMessage>}
                            {inviteSuccess && <SuccessMessage>{inviteSuccess}</SuccessMessage>}
                        </Form>
                        <ButtonGroup>
                            <SecondaryButton type="button" onClick={() => setIsModalOpen(false)}>Cancel</SecondaryButton>
                            <Button type="submit" onClick={handleInviteSubmit} disabled={isInviting}>
                                {isInviting ? 'Sending...' : 'Send Invitation'}
                            </Button>
                        </ButtonGroup>
                    </ModalContent>
                </ModalBackdrop>
            )}
        </div>
    );
}