// src/pages/admin/UserManagementPage.tsx
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import styled from 'styled-components';
import { supabase } from '../../supabaseClient';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

// --- Styled Components (some are new/updated) ---
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
    white-space: nowrap;
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

const ActionButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    color: #6b7280;
    &:hover { color: #111827; }
    &:disabled { color: #d1d5db; cursor: not-allowed; }
`;

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

const InputGroup = styled.div` display: flex; flex-direction: column; gap: 0.5rem; `;
const Label = styled.label` font-weight: 500; `;
const Input = styled.input` padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; `;
const Select = styled.select` padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; background-color: white; `;
const ButtonGroup = styled.div` display: flex; justify-content: flex-end; gap: 1rem; padding: 1rem 2rem; border-top: 1px solid #e5e7eb; background-color: #f9fafb; `;
const ErrorMessage = styled.p` color: #ef4444; font-size: 0.875rem; text-align: center; margin-top: 1rem;`;
const SuccessMessage = styled.p` color: #16a34a; font-size: 0.875rem; `;

// --- Type Definition for a User ---
interface User {
    id: string;
    email: string;
    created_at: string;
    last_sign_in_at: string;
    role: 'merchant' | 'admin' | null;
}

const API_BASE_URL = 'https://ai-routing-engine.onrender.com/admin';

export function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);

    // --- State for Modals ---
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    
    // --- State for Form Operations ---
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('merchant');
    const [newRole, setNewRole] = useState<'merchant' | 'admin'>('merchant');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalError, setModalError] = useState('');
    const [modalSuccess, setModalSuccess] = useState('');
    
    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated.');
            setCurrentAdminId(session.user.id);

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

    useEffect(() => {
        fetchUsers();
    }, []);

    const closeModals = () => {
        setInviteModalOpen(false);
        setEditModalOpen(false);
        setDeleteModalOpen(false);
        setModalError('');
        setModalSuccess('');
        setIsSubmitting(false);
    };
    
    // --- Handlers for opening modals ---
    const handleOpenEditModal = (user: User) => {
        setEditingUser(user);
        setNewRole(user.role || 'merchant');
        setEditModalOpen(true);
    };

    const handleOpenDeleteModal = (user: User) => {
        setDeletingUser(user);
        setDeleteModalOpen(true);
    };

    // --- API Call Handlers ---
    const handleInviteSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true); setModalError(''); setModalSuccess('');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Authentication session expired.');
            const response = await fetch(`${API_BASE_URL}/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole })
            });
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.detail); }
            setInviteEmail('');
            await fetchUsers();
            closeModals();
        } catch (err: any) { setModalError(err.message); } finally { setIsSubmitting(false); }
    };

    const handleRoleUpdate = async (event: FormEvent) => {
        event.preventDefault();
        if (!editingUser) return;
        setIsSubmitting(true); setModalError(''); setModalSuccess('');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Authentication session expired.');
            const response = await fetch(`${API_BASE_URL}/users/${editingUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
                body: JSON.stringify({ role: newRole })
            });
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.detail); }
            await fetchUsers(); // Refresh the list
            closeModals();
        } catch (err: any) { setModalError(err.message); } finally { setIsSubmitting(false); }
    };
    
    const handleDeleteUser = async () => {
        if (!deletingUser) return;
        setIsSubmitting(true); setModalError('');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Authentication session expired.');
            const response = await fetch(`${API_BASE_URL}/users/${deletingUser.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.detail); }
            setUsers(users.filter(u => u.id !== deletingUser.id)); // Optimistic update
            closeModals();
        } catch (err: any) { setModalError(err.message); } finally { setIsSubmitting(false); }
    };

    return (
        <div>
            <HeaderContainer>
                <PageHeader>User Management</PageHeader>
                <Button onClick={() => setInviteModalOpen(true)}><PlusCircle size={16} /> Invite User</Button>
            </HeaderContainer>

            <TableContainer>
                <Table>
                    <thead>
                        <tr>
                            <Th>Email</Th>
                            <Th>Role</Th>
                            <Th>Last Sign In</Th>
                            <Th>Date Joined</Th>
                            <Th>Actions</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? ( <tr><Td colSpan={5}>Loading users...</Td></tr> ) : 
                         error ? ( <tr><Td colSpan={5} style={{ color: 'red' }}>{error}</Td></tr> ) : 
                        (
                            users.map((user) => (
                                <tr key={user.id}>
                                    <Td>{user.email}</Td>
                                    <Td style={{ textTransform: 'capitalize' }}>{user.role || 'N/A'}</Td>
                                    <Td>{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}</Td>
                                    <Td>{new Date(user.created_at).toLocaleString()}</Td>
                                    <Td>
                                        <ActionButton onClick={() => handleOpenEditModal(user)} disabled={user.id === currentAdminId} title="Edit user role">
                                            <Edit size={18} />
                                        </ActionButton>
                                        <ActionButton onClick={() => handleOpenDeleteModal(user)} disabled={user.id === currentAdminId} title="Delete user">
                                            <Trash2 size={18} />
                                        </ActionButton>
                                    </Td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </TableContainer>

            {/* Invite Modal */}
            {isInviteModalOpen && (
                 <ModalBackdrop>
                 <ModalContent>
                     <ModalHeader>Invite New User</ModalHeader>
                     <Form onSubmit={handleInviteSubmit}>
                         <InputGroup><Label htmlFor="email">Email Address</Label><Input id="email" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required /></InputGroup>
                         <InputGroup><Label htmlFor="role">Role</Label><Select id="role" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}><option value="merchant">Merchant</option><option value="admin">Admin</option></Select></InputGroup>
                         {modalError && <ErrorMessage>{modalError}</ErrorMessage>}
                     </Form>
                     <ButtonGroup>
                         <SecondaryButton type="button" onClick={closeModals}>Cancel</SecondaryButton>
                         <Button type="submit" onClick={handleInviteSubmit} disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send Invitation'}</Button>
                     </ButtonGroup>
                 </ModalContent>
             </ModalBackdrop>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && editingUser && (
                <ModalBackdrop>
                <ModalContent>
                    <ModalHeader>Edit User Role</ModalHeader>
                    <Form onSubmit={handleRoleUpdate}>
                        <p>Editing user: <strong>{editingUser.email}</strong></p>
                        <InputGroup>
                            <Label htmlFor="role">Role</Label>
                            <Select id="role" value={newRole} onChange={(e) => setNewRole(e.target.value as 'merchant' | 'admin')}>
                                <option value="merchant">Merchant</option>
                                <option value="admin">Admin</option>
                            </Select>
                        </InputGroup>
                        {modalError && <ErrorMessage>{modalError}</ErrorMessage>}
                    </Form>
                    <ButtonGroup>
                        <SecondaryButton type="button" onClick={closeModals}>Cancel</SecondaryButton>
                        <Button type="submit" onClick={handleRoleUpdate} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
                    </ButtonGroup>
                </ModalContent>
            </ModalBackdrop>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && deletingUser && (
                 <ModalBackdrop>
                 <ModalContent>
                     <ModalHeader>Delete User</ModalHeader>
                     <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <p>Are you sure you want to permanently delete this user?</p>
                        <p><strong>{deletingUser.email}</strong></p>
                        {modalError && <ErrorMessage>{modalError}</ErrorMessage>}
                     </div>
                     <ButtonGroup>
                         <SecondaryButton type="button" onClick={closeModals}>Cancel</SecondaryButton>
                         <Button type="button" onClick={handleDeleteUser} disabled={isSubmitting} style={{backgroundColor: '#ef4444'}}>
                            {isSubmitting ? 'Deleting...' : 'Delete User'}
                         </Button>
                     </ButtonGroup>
                 </ModalContent>
             </ModalBackdrop>
            )}
        </div>
    );
}