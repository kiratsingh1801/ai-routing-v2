// src/components/ResultsDisplay.tsx
import styled from 'styled-components';

// Define the shape of a single ranked PSP
interface RankedPsp {
  rank: number;
  psp_id: string;
  psp_name: string;
  score: number;
  reason: string;
}

// Define the shape of the props this component will receive
interface ResultsDisplayProps {
  rankedPsps: RankedPsp[];
  isLoading: boolean;
  error: string | null;
}

const ResultsContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
`;

const LoadingText = styled.p`
  text-align: center;
  color: #6b7280;
  font-style: italic;
`;

const ErrorText = styled.p`
  text-align: center;
  color: #ef4444; /* Red color for errors */
  font-weight: 500;
`;

const ResultsTable = styled.table`
  width: 100%;
  text-align: left;
  border-collapse: collapse;
`;

const Th = styled.th`
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
`;

const Td = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
`;

export function ResultsDisplay({ rankedPsps, isLoading, error }: ResultsDisplayProps) {
  if (isLoading) {
    return <ResultsContainer><LoadingText>Routing with AI...</LoadingText></ResultsContainer>;
  }

  if (error) {
    return <ResultsContainer><ErrorText>{error}</ErrorText></ResultsContainer>;
  }

  if (rankedPsps.length === 0) {
    return null; // Don't show anything if there are no results yet
  }

  return (
    <ResultsContainer>
      <ResultsTable>
        <thead>
          <tr>
            <Th>Rank</Th>
            <Th>PSP Name</Th>
            <Th>Reason</Th>
          </tr>
        </thead>
        <tbody>
          {rankedPsps.map((psp) => (
            <tr key={psp.psp_id}>
              <Td>{psp.rank}</Td>
              <Td>{psp.psp_name}</Td>
              <Td>{psp.reason}</Td>
            </tr>
          ))}
        </tbody>
      </ResultsTable>
    </ResultsContainer>
  );
}