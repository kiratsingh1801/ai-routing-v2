// src/pages/admin/PspManagementPage.tsx
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import styled from 'styled-components';
import { supabase } from '../../supabaseClient';
import { PlusCircle, Edit } from 'lucide-react';

// --- Styled Components for the page, table, and modal ---
const PageHeader = styled.h1`
  font-size: 1.875rem; font-weight: 700; color: #111827; margin-bottom: 1rem;
`;
const HeaderContainer = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;
`;
const TableContainer = styled.div`
  background-color: white; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
`;
const Table = styled.table`
  width: 100%; text-align: left; border-collapse: collapse;
`;
const Th = styled.th`
  padding: 1rem 1.5rem; border-bottom: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: 600;
`;
const Td = styled.td`
  padding: 1rem 1.5rem; border-bottom: 1px solid #e5e7eb; font-size: 0.875rem;
`;
const Button = styled.button`
  padding: 0.5rem 1rem; background-color: #2563eb; color: white; font-weight: 500; border: none;
  border-radius: 0.375rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;
  &:hover { background-color: #1d4ed8; }
`;
const ModalBackdrop = styled.div`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center;
`;
const ModalContent = styled.div`
  background-color: white; padding: 2rem; border-radius: 0.5rem; width: 90%; max-width: 500px;
`;
const Form = styled.form` display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; `;
const Input = styled.input` width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem;`;
const CheckboxLabel = styled.label` display: flex; align-items: center; gap: 0.5rem; grid-column: span 2;`;
const ButtonGroup = styled.div` grid-column: span 2; display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem;`;

const API_URL = 'https://ai-routing-engine.onrender.com/admin/psps';

export function PspManagementPage() {
  const [psps, setPsps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPsp, setEditingPsp] = useState<any | null>(null);

  const fetchPsps = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated.');

      const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch PSPs.');

      const data = await response.json();
      setPsps(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPsps();
  }, []);

  const handleOpenModal = (psp: any = null) => {
    setEditingPsp(psp);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPsp(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const pspData = {
        name: formData.get('name'),
        success_rate: parseFloat(formData.get('success_rate') as string),
        fee_percent: parseFloat(formData.get('fee_percent') as string),
        speed_score: parseFloat(formData.get('speed_score') as string),
        risk_score: parseFloat(formData.get('risk_score') as string),
        is_active: formData.get('is_active') === 'on',
    };

    const url = editingPsp ? `${API_URL}/${editingPsp.id}` : API_URL;
    const method = editingPsp ? 'PUT' : 'POST';

    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated.');

        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pspData)
        });
        if (!response.ok) throw new Error('Failed to save PSP.');

        fetchPsps(); // Refresh the list
        handleCloseModal();
    } catch (err: any) {
        alert(err.message);
    }
  };

  return (
    <div>
      <HeaderContainer>
        <PageHeader>PSP Management</PageHeader>
        <Button onClick={() => handleOpenModal()}><PlusCircle size={16}/> Add New PSP</Button>
      </HeaderContainer>

      <TableContainer>
        <Table>
          {/* ... table headers ... */}
          <thead>
            <tr>
                <Th>Name</Th><Th>Success Rate</Th><Th>Fee %</Th><Th>Active</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><Td colSpan={5}>Loading PSPs...</Td></tr>
            ) : error ? (
              <tr><Td colSpan={5} style={{ color: 'red' }}>{error}</Td></tr>
            ) : (
              psps.map((psp) => (
                <tr key={psp.id}>
                  <Td>{psp.name}</Td>
                  <Td>{(psp.success_rate * 100).toFixed(1)}%</Td>
                  <Td>{psp.fee_percent}%</Td>
                  <Td>{psp.is_active ? '✅' : '❌'}</Td>
                  <Td><Button onClick={() => handleOpenModal(psp)} style={{backgroundColor: '#6b7280'}}><Edit size={16}/></Button></Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </TableContainer>

      {isModalOpen && (
        <ModalBackdrop>
            <ModalContent>
                <h2>{editingPsp ? 'Edit PSP' : 'Add New PSP'}</h2>
                <Form onSubmit={handleSubmit}>
                    <label>Name</label><Input name="name" defaultValue={editingPsp?.name || ''} required />
                    <label>Success Rate (0-1)</label><Input name="success_rate" type="number" step="0.01" defaultValue={editingPsp?.success_rate || ''} required />
                    <label>Fee %</label><Input name="fee_percent" type="number" step="0.01" defaultValue={editingPsp?.fee_percent || ''} required />
                    <label>Speed Score (0-1)</label><Input name="speed_score" type="number" step="0.01" defaultValue={editingPsp?.speed_score || ''} required />
                    <label>Risk Score (0-1)</label><Input name="risk_score" type="number" step="0.01" defaultValue={editingPsp?.risk_score || ''} required />
                    <CheckboxLabel><input name="is_active" type="checkbox" defaultChecked={editingPsp ? editingPsp.is_active : true}/> Active</CheckboxLabel>
                    <ButtonGroup>
                        <Button type="button" onClick={handleCloseModal} style={{backgroundColor: '#6b7280'}}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </ButtonGroup>
                </Form>
            </ModalContent>
        </ModalBackdrop>
      )}
    </div>
  );
}