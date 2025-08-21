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
    margin-right: 0.5rem;
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
const SuccessMessage = styled.p` color: #16a34a; font-size: 0.875rem; text-align: center; margin-top: 1rem;`;

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
    const [isModalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'invite' | 'edit' | 'delete' | null>(null);
    const [activeUser, setActiveUser] = useState<User | null>(null);
    const [inviteEmail, setInviteEmail] = useState('');
    const [userRole, setUserRole] = useState<'merchant' | 'admin'>('merchant');
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
            if (!response.ok) { const d = await response.json(); throw new Error(d.detail); }
            const data = await response.json();
            setUsers(data);
        } catch (err: any) { setError(err.message); } finally { setIsLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, []);

    const openModal = (type: 'invite' | 'edit' | 'delete', user: User | null = null) => {
        setModalType(type);
        setActiveUser(user);
        if (user && type === 'edit') setUserRole(user.role || 'merchant');
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setTimeout(() => {
            setModalType(null);
            setActiveUser(null);
            setModalError('');
            setModalSuccess('');
            setInviteEmail('');
            setIsSubmitting(false);
        }, 300);
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true); setModalError(''); setModalSuccess('');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Authentication expired.');
            let url = '';
            let method = '';
            let body: any = {};

            if (modalType === 'invite') {
                url = `${API_BASE_URL}/invite`;
                method = 'POST';
                body = { email: inviteEmail, role: userRole };
            } else if (modalType === 'edit' && activeUser) {
                url = `${API_BASE_URL}/users/${activeUser.id}`;
                method = 'PUT';
                body = { role: userRole };
            }

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
                body: JSON.stringify(body)
            });
            if (!response.ok) { const d = await response.json(); throw new Error(d.detail); }
            
            setModalSuccess('Success!');
            await fetchUsers();
            setTimeout(closeModal, 1500);

        } catch (err: any) { setModalError(err.message); } finally { setIsSubmitting(false); }
    };
    
    const handleDelete = async () => {
        if (!activeUser) return;
        setIsSubmitting(true); setModalError('');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Authentication expired.');
            const response = await fetch(`${API_BASE_URL}/users/${activeUser.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (!response.ok) { const d = await response.json(); throw new Error(d.detail); }
            closeModal();
            setUsers(users.filter(u => u.id !== activeUser.id));
        } catch (err: any) { setModalError(err.message); } finally { setIsSubmitting(false); }
    };

    return (
        <div>
            <HeaderContainer>
                <PageHeader>User Management</PageHeader>
                <Button onClick={() => openModal('invite')}><PlusCircle size={16} /> Invite User</Button>
            </HeaderContainer>

            <TableContainer>
                <Table>
                    <thead>
                        <tr>
                            <Th>Email</Th><Th>Role</Th><Th>Last Sign In</Th><Th>Date Joined</Th><Th>Actions</Th>
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
                                        <ActionButton onClick={() => openModal('edit', user)} disabled={user.id === currentAdminId} title="Edit user role"><Edit size={18} /></ActionButton>
                                        <ActionButton onClick={() => openModal('delete', user)} disabled={user.id === currentAdminId} title="Delete user"><Trash2 size={18} /></ActionButton>
                                    </Td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </TableContainer>

            {isModalOpen && (
                 <ModalBackdrop>
                 <ModalContent>
                     {modalType === 'invite' && <>
                         <ModalHeader>Invite New User</ModalHeader>
                         <Form onSubmit={handleSubmit}>
                             <InputGroup><Label>Email Address</Label><Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required /></InputGroup>
                             <InputGroup><Label>Role</Label><Select value={userRole} onChange={(e) => setUserRole(e.target.value as 'merchant' | 'admin')}><option value="merchant">Merchant</option><option value="admin">Admin</option></Select></InputGroup>
                             {modalError && <ErrorMessage>{modalError}</ErrorMessage>}
                             {modalSuccess && <SuccessMessage>{modalSuccess}</SuccessMessage>}
                         </Form>
                         <ButtonGroup>
                             <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
                             <Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send Invitation'}</Button>
                         </ButtonGroup>
                     </>}
                     {modalType === 'edit' && activeUser && <>
                         <ModalHeader>Edit User Role</ModalHeader>
                         <Form onSubmit={handleSubmit}>
                             <p>Editing user: <strong>{activeUser.email}</strong></p>
                             <InputGroup>
                                 <Label>Role</Label>
                                 <Select value={userRole} onChange={(e) => setUserRole(e.target.value as 'merchant' | 'admin')}><option value="merchant">Merchant</option><option value="admin">Admin</option></Select>
                             </InputGroup>
                             {modalError && <ErrorMessage>{modalError}</ErrorMessage>}
                             {modalSuccess && <SuccessMessage>{modalSuccess}</SuccessMessage>}
                         </Form>
                         <ButtonGroup>
                             <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
                             <Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
                         </ButtonGroup>
                     </>}
                     {modalType === 'delete' && activeUser && <>
                         <ModalHeader>Delete User</ModalHeader>
                         <div style={{ padding: '2rem', textAlign: 'center' }}>
                            <p>Are you sure you want to permanently delete this user?</p>
                            <p><strong>{activeUser.email}</strong></p>
                             {modalError && <ErrorMessage>{modalError}</ErrorMessage>}
                         </div>
                         <ButtonGroup>
                             <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
                             <Button onClick={handleDelete} disabled={isSubmitting} style={{backgroundColor: '#ef4444'}}>{isSubmitting ? 'Deleting...' : 'Delete User'}</Button>
                         </ButtonGroup>
                     </>}
                 </ModalContent>
             </ModalBackdrop>
            )}
        </div>
    );
}