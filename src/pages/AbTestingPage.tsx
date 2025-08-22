// src/pages/AbTestingPage.tsx
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';

// --- Type Definitions ---
interface AbTestConfig {
    ab_testing_enabled: boolean;
    ab_test_psp_a_id: string | null;
    ab_test_psp_b_id: string | null;
    ab_test_split_percentage: number;
}

interface Psp {
    id: string;
    name: string;
}

// --- Styled Components ---
const PageHeader = styled.h1`
    font-size: 1.875rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 2rem;
`;

const FormContainer = styled.div`
    background-color: white;
    border-radius: 0.5rem;
    padding: 2rem;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    max-width: 700px;
`;

const Section = styled.div`
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid #e5e7eb;
`;

const ToggleContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const ToggleLabel = styled.label`
    font-size: 1.125rem;
    font-weight: 600;
`;

const ToggleSwitch = styled.label`
    /* ... Switch styles ... */
`;

const SelectContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-top: 1.5rem;
`;

const SelectGroup = styled.div` display: flex; flex-direction: column; gap: 0.5rem; `;
const Label = styled.label` font-weight: 500; `;
const Select = styled.select` padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; `;

const SliderContainer = styled.div` margin-top: 1.5rem; `;
const SplitLabel = styled.div` display: flex; justify-content: space-between; font-weight: 500; margin-bottom: 0.5rem; `;
const Input = styled.input``;

const Button = styled.button`
    padding: 0.75rem 1.5rem;
    background-color: #2563eb;
    color: white;
    font-weight: 600;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    &:disabled { opacity: 0.5; }
`;

const API_BASE_URL = 'https://ai-routing-engine.onrender.com';

export function AbTestingPage() {
    const [config, setConfig] = useState<AbTestConfig | null>(null);
    const [psps, setPsps] = useState<Psp[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) throw new Error('Not authenticated.');

                // Fetch available PSPs for dropdowns
                const pspResponse = await fetch(`${API_BASE_URL}/admin/psps`, {
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                });
                if (!pspResponse.ok) throw new Error('Failed to fetch PSPs.');
                const pspData = await pspResponse.json();
                setPsps(pspData);

                // Fetch current A/B config
                const configResponse = await fetch(`${API_BASE_URL}/merchant/ab-test-config`, {
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                });
                if (!configResponse.ok) throw new Error('Failed to fetch A/B test config.');
                const configData = await configResponse.json();
                setConfig(configData);

            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleConfigChange = (field: keyof AbTestConfig, value: any) => {
        if (config) {
            setConfig({ ...config, [field]: value });
        }
    };

    const handleSave = async () => {
        if (!config) return;
        setIsSaving(true);
        setError(null);
        setSuccessMessage('');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated.');
            const response = await fetch(`${API_BASE_URL}/merchant/ab-test-config`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
                body: JSON.stringify(config)
            });
            if (!response.ok) { const d = await response.json(); throw new Error(d.detail); }
            setSuccessMessage('Settings saved successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <p>Loading A/B Testing configuration...</p>;
    if (error) return <p style={{color: 'red'}}>Error: {error}</p>;
    if (!config) return <p>Could not load configuration.</p>;

    return (
        <div>
            <PageHeader>A/B Testing</PageHeader>
            <FormContainer>
                <Section>
                    <ToggleContainer>
                        <ToggleLabel>Enable A/B Testing Mode</ToggleLabel>
                        <input type="checkbox" checked={config.ab_testing_enabled} onChange={(e) => handleConfigChange('ab_testing_enabled', e.target.checked)} />
                    </ToggleContainer>
                </Section>
                
                {config.ab_testing_enabled && (
                    <>
                        <Section>
                            <Label>Select PSPs to Compare</Label>
                            <SelectContainer>
                                <SelectGroup>
                                    <Label>PSP A</Label>
                                    <Select value={config.ab_test_psp_a_id || ''} onChange={(e) => handleConfigChange('ab_test_psp_a_id', e.target.value)}>
                                        <option value="">Select PSP</option>
                                        {psps.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </Select>
                                </SelectGroup>
                                <SelectGroup>
                                    <Label>PSP B</Label>
                                    <Select value={config.ab_test_psp_b_id || ''} onChange={(e) => handleConfigChange('ab_test_psp_b_id', e.target.value)}>
                                        <option value="">Select PSP</option>
                                        {psps.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </Select>
                                </SelectGroup>
                            </SelectContainer>
                        </Section>
                        <Section>
                            <SliderContainer>
                                <SplitLabel>
                                    <span>PSP A: {config.ab_test_split_percentage}%</span>
                                    <span>PSP B: {100 - config.ab_test_split_percentage}%</span>
                                </SplitLabel>
                                <Input type="range" min="0" max="100" value={config.ab_test_split_percentage} onChange={(e) => handleConfigChange('ab_test_split_percentage', parseInt(e.target.value))} style={{width: '100%'}}/>
                            </SliderContainer>
                        </Section>
                    </>
                )}
                
                <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>
                    {successMessage && <p style={{color: '#16a34a', marginRight: '1rem'}}>{successMessage}</p>}
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Settings'}
                    </Button>
                </div>
            </FormContainer>
        </div>
    );
}
