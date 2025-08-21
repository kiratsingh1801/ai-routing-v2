// src/pages/admin/PspManagementPage.tsx
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import styled from 'styled-components';
import { supabase } from '../../supabaseClient';
import { PlusCircle, Edit } from 'lucide-react';

// --- Styled Components (with minor adjustments for a larger form) ---
const PageHeader = styled.h1`
  font-size: 1.875rem; font-weight: 700; color: #111827; margin-bottom: 1rem;
`;
const HeaderContainer = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;
`;
const TableContainer = styled.div`
  background-color: white; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); overflow-x: auto;
`;
const Table = styled.table`
  width: 100%; text-align: left; border-collapse: collapse;
`;
const Th = styled.th`
  padding: 1rem 1.5rem; border-bottom: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: 600; white-space: nowrap;
`;
const Td = styled.td`
  padding: 1rem 1.5rem; border-bottom: 1px solid #e5e7eb; font-size: 0.875rem;
`;
const Button = styled.button`
  padding: 0.6rem 1.5rem;
  background-color: #2563eb;
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);

  &:hover {
    background-color: #1d4ed8;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const SecondaryButton = styled(Button)`
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;
  &:hover {
    background-color: #f9fafb;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  }
`;

const ModalBackdrop = styled.div`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
  padding: 2rem;
  overflow-y: auto;
`;
const ModalContent = styled.div`
  background-color: white; padding: 2rem; border-radius: 0.5rem; width: 90%; max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
`;
const Form = styled.form` display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; `;
const Input = styled.input` width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem;`;
const FullWidthInputGroup = styled.div` grid-column: span 2; `;
const ButtonGroup = styled.div` grid-column: span 2; display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem;`;
const FormSectionTitle = styled.h3`
    grid-column: span 2;
    font-weight: 600;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 0.5rem;
    margin-top: 1rem;
`;

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
        const response = await fetch(API_URL, { headers: { 'Authorization': `Bearer ${session.access_token}` } });
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
    
    const getFloat = (name: string) => parseFloat(formData.get(name) as string) || null;
    const getStringArray = (name: string) => (formData.get(name) as string)?.split(',').map(s => s.trim()).filter(Boolean) || [];

    const pspData = {
        name: formData.get('name'),
        is_active: formData.get('is_active') === 'on',
        speed_score: getFloat('speed_score'),
        risk_score: getFloat('risk_score'),
        payin_fee_percent: getFloat('payin_fee_percent'),
        payout_fee_percent: getFloat('payout_fee_percent'),
        payin_success_rate: getFloat('payin_success_rate'),
        payout_success_rate: getFloat('payout_success_rate'),
        supported_services: getStringArray('supported_services'),
        supported_countries: getStringArray('supported_countries'),
        supported_currencies: getStringArray('supported_currencies'),
        supported_payment_methods: getStringArray('supported_payment_methods'),
        supported_card_brands: getStringArray('supported_card_brands'),
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
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || 'Failed to save PSP.');
        }

        fetchPsps();
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
          <thead>
            <tr>
                <Th>Name</Th>
                <Th>Pay-in Fee</Th>
                <Th>Pay-in Success</Th>
                <Th>Payout Fee</Th>
                <Th>Payout Success</Th>
                <Th>Active</Th>
                <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><Td colSpan={7}>Loading PSPs...</Td></tr>
            ) : error ? (
              <tr><Td colSpan={7} style={{ color: 'red' }}>{error}</Td></tr>
            ) : (
              psps.map((psp) => (
                <tr key={psp.id}>
                  <Td>{psp.name}</Td>
                  <Td>{psp.payin_fee_percent}%</Td>
                  <Td>{(psp.payin_success_rate * 100).toFixed(1)}%</Td>
                  <Td>{psp.payout_fee_percent}%</Td>
                  <Td>{(psp.payout_success_rate * 100).toFixed(1)}%</Td>
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
                    <FormSectionTitle>General</FormSectionTitle>
                    <label>Name</label><Input name="name" defaultValue={editingPsp?.name || ''} required />
                    <label>Active</label><input name="is_active" type="checkbox" defaultChecked={editingPsp ? editingPsp.is_active : true}/>
                    <label>Speed Score (0-1)</label><Input name="speed_score" type="number" step="0.01" defaultValue={editingPsp?.speed_score || ''} />
                    <label>Risk Score (0-1)</label><Input name="risk_score" type="number" step="0.01" defaultValue={editingPsp?.risk_score || ''} />

                    <FormSectionTitle>Pay-in Details</FormSectionTitle>
                    <label>Pay-in Fee %</label><Input name="payin_fee_percent" type="number" step="0.01" defaultValue={editingPsp?.payin_fee_percent || ''} />
                    <label>Pay-in Success (0-1)</label><Input name="payin_success_rate" type="number" step="0.01" defaultValue={editingPsp?.payin_success_rate || ''} />

                    <FormSectionTitle>Payout Details</FormSectionTitle>
                    <label>Payout Fee %</label><Input name="payout_fee_percent" type="number" step="0.01" defaultValue={editingPsp?.payout_fee_percent || ''} />
                    <label>Payout Success (0-1)</label><Input name="payout_success_rate" type="number" step="0.01" defaultValue={editingPsp?.payout_success_rate || ''} />
                    
                    <FormSectionTitle>Supported Features (comma-separated)</FormSectionTitle>
                    <FullWidthInputGroup>
                        <label>Services (e.g., payin, payout)</label>
                        <Input name="supported_services" defaultValue={editingPsp?.supported_services?.join(', ') || 'payin, payout'} />
                    </FullWidthInputGroup>
                    <FullWidthInputGroup>
                        <label>Countries (e.g., US, GB, IN)</label>
                        <Input name="supported_countries" defaultValue={editingPsp?.supported_countries?.join(', ') || 'US, GB, EUR'} />
                    </FullWidthInputGroup>
                    <FullWidthInputGroup>
                        <label>Currencies (e.g., USD, EUR, GBP)</label>
                        <Input name="supported_currencies" defaultValue={editingPsp?.supported_currencies?.join(', ') || 'USD, EUR, GBP'} />
                    </FullWidthInputGroup>
                    <FullWidthInputGroup>
                        <label>Payment Methods (e.g., credit_card, apple_pay)</label>
                        <Input name="supported_payment_methods" defaultValue={editingPsp?.supported_payment_methods?.join(', ') || 'credit_card, apple_pay'} />
                    </FullWidthInputGroup>
                    <FullWidthInputGroup>
                        <label>Card Brands (e.g., visa, mastercard, amex)</label>
                        <Input name="supported_card_brands" defaultValue={editingPsp?.supported_card_brands?.join(', ') || 'visa, mastercard, amex'} />
                    </FullWidthInputGroup>

                    <ButtonGroup>
                        <SecondaryButton type="button" onClick={handleCloseModal}>Cancel</SecondaryButton>
                        <Button type="submit">Save</Button>
                    </ButtonGroup>
                </Form>
            </ModalContent>
        </ModalBackdrop>
      )}
    </div>
  );
}
