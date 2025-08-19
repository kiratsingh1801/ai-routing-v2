// src/components/StatCard.tsx
import { ElementType } from 'react'; // CHANGED: Import ElementType from React
import styled from 'styled-components';

const Card = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const CardTitle = styled.h3`
  font-weight: 500;
  color: #6b7280;
`;

const CardValue = styled.p`
  font-size: 2.25rem; /* 36px */
  font-weight: 700;
  color: #111827;
`;

interface StatCardProps {
  title: string;
  value: string;
  Icon: ElementType; // CHANGED: Use the more general ElementType
}

export function StatCard({ title, value, Icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <Icon size={24} color="#9ca3af" />
      </CardHeader>
      <CardValue>{value}</CardValue>
    </Card>
  );
}