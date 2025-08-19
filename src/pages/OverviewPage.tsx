// src/pages/OverviewPage.tsx
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { StatCard } from '../components/StatCard';
import { DollarSign, Zap, CheckCircle, Clock } from 'lucide-react';

const PageHeader = styled.h1`
  font-size: 1.875rem; /* 30px */
  font-weight: 700;
  color: #111827;
  margin-bottom: 2rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const LoadingText = styled.p`
  color: #6b7280;
  font-style: italic;
`;

// The URL for our new backend endpoint
const STATS_API_URL = 'https://ai-routing-engine.onrender.com/dashboard-stats';

export function OverviewPage() {
  // State for our data, loading status, and errors
  const [statsData, setStatsData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This function runs once when the component loads
    const fetchStats = async () => {
      try {
        const response = await fetch(STATS_API_URL);
        if (!response.ok) {
          throw new Error('Failed to fetch stats from the server.');
        }
        const data = await response.json();
        setStatsData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []); // The empty array ensures this effect runs only once

  if (isLoading) {
    return <LoadingText>Loading dashboard data...</LoadingText>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  // Build the stats array from the live data returned by the API
  const stats = [
    { title: 'Total Volume (24h)', value: `$${statsData.total_volume_24h.toFixed(2)}`, Icon: DollarSign },
    { title: 'Total Transactions (24h)', value: statsData.total_transactions_24h.toString(), Icon: Zap },
    { title: 'Success Rate (24h)', value: `${statsData.success_rate_24h.toFixed(1)}%`, Icon: CheckCircle },
    { title: 'Avg. Speed', value: statsData.avg_speed, Icon: Clock },
  ];

  return (
    <div>
      <PageHeader>Overview</PageHeader>
      <Grid>
        {stats.map((stat) => (
          <StatCard key={stat.title} title={stat.title} value={stat.value} Icon={stat.Icon} />
        ))}
      </Grid>
    </div>
  );
}