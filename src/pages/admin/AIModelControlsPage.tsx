import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../supabaseClient';

// --- Types ---
interface AIConfig {
    strategy: string;
    success_rate_weight: number;
    cost_weight: number;
    speed_weight: number;
    risk_weight: number;
}

// --- API Helper ---
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const authenticatedFetch = async (path: string, options: RequestInit = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        throw new Error("User is not authenticated.");
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        ...options.headers,
    };

    const response = await fetch(`${apiBaseUrl}/${path}`, { ...options, headers });

    if (!response.ok) {
        // Try to parse error detail from JSON response
        const errorData = await response.json().catch(() => ({ detail: 'The server returned a non-JSON response.' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};


// --- Styled Components ---
const PageHeader = styled.h1`
  color: #333;
  font-size: 28px;
  margin-bottom: 20px;
`;

const ConfigCard = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
`;

const StrategyTitle = styled.h2`
  color: #007bff;
  font-size: 22px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
  margin-bottom: 20px;
`;

const ControlRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

const ControlLabel = styled.label`
  flex-basis: 150px;
  font-weight: 500;
  color: #555;
`;

const Slider = styled.input`
  flex-grow: 1;
  margin: 0 15px;
`;

const WeightValue = styled.span`
  font-variant-numeric: tabular-nums;
  font-weight: bold;
  min-width: 40px;
  text-align: right;
`;

const SaveButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 25px;
  font-size: 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #218838;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const TotalWarning = styled.div`
    color: #dc3545;
    font-weight: bold;
    margin-top: 5px;
`;

const ErrorMessage = styled.div`
    color: #dc3545;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    padding: 15px;
    border-radius: 6px;
    margin-bottom: 20px;
`;


export const AIModelControlsPage = () => {
    const [configs, setConfigs] = useState<AIConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchConfig = async () => {
            setIsLoading(true);
            setError('');
            try {
                // UPDATED to call the new renamed endpoint
                const data = await authenticatedFetch('admin/ai-settings');
                setConfigs(data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch config.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchConfig();
    }, []);

    const handleWeightChange = (strategy: string, weightType: keyof AIConfig, value: number) => {
        setConfigs(prevConfigs => 
            prevConfigs.map(config => 
                config.strategy === strategy 
                    ? { ...config, [weightType]: value }
                    : config
            )
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError('');
        try {
            // UPDATED to call the new renamed endpoint
            await authenticatedFetch('admin/ai-settings', {
                method: 'PUT',
                body: JSON.stringify(configs),
            });
            alert('Configuration saved successfully!');
        } catch (err: any) {
            setError(err.message || 'Failed to save config.');
        } finally {
            setIsSaving(false);
        }
    };
    
    const calculateTotal = (config: AIConfig) => {
        return (config.success_rate_weight + config.cost_weight + config.speed_weight + config.risk_weight).toFixed(2);
    }

    if (isLoading) return <div>Loading AI Settings...</div>;

    return (
        <div>
            <PageHeader>AI Model Controls</PageHeader>

            {error && <ErrorMessage>Error: {error}</ErrorMessage>}

            <p style={{marginBottom: "20px"}}>Adjust the importance of different factors for each routing strategy. The weights for each strategy must sum up to 1.0.</p>
            {configs.map(config => {
                const total = parseFloat(calculateTotal(config));
                const isInvalid = total !== 1.0;
                return (
                    <ConfigCard key={config.strategy}>
                        <StrategyTitle>{config.strategy.replace('_', ' ')}</StrategyTitle>
                        {(Object.keys(config) as Array<keyof AIConfig>).filter(key => key.includes('_weight')).map(key => (
                            <ControlRow key={key}>
                                <ControlLabel>{key.replace('_weight', '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</ControlLabel>
                                <Slider 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.05"
                                    value={config[key] as number}
                                    onChange={(e) => handleWeightChange(config.strategy, key, parseFloat(e.target.value))}
                                />
                                <WeightValue>{(config[key] as number).toFixed(2)}</WeightValue>
                            </ControlRow>
                        ))}
                         <div style={{fontWeight: "bold", marginTop: "10px"}}>Total: {total.toFixed(2)}</div>
                        {isInvalid && <TotalWarning>Total weights must sum to 1.0</TotalWarning>}
                    </ConfigCard>
                );
            })}
            
            <SaveButton onClick={handleSave} disabled={isSaving || configs.some(c => parseFloat(calculateTotal(c)) !== 1.0)}>
                {isSaving ? 'Saving...' : 'Save All Changes'}
            </SaveButton>
        </div>
    );
};