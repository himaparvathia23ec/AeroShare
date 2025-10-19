import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Download, 
  Wifi, 
  WifiOff, 
  Brain, 
  Users, 
  Activity,
  Zap,
  Shield,
  Clock
} from 'lucide-react';

import { TransferData, AIPrediction, P2PConnection } from '../types';
import TransferCard from './TransferCard';
import AIPredictionCard from './AIPredictionCard';
import P2PConnectionCard from './P2PConnectionCard';
import NetworkStatus from './NetworkStatus';
import AIPerformanceChart from './AIPerformanceChart';

interface DashboardProps {
  transfers: TransferData[];
  aiPredictions: AIPrediction[];
  p2pConnections: P2PConnection[];
  isOnline: boolean;
}

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 25px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 20px;
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
`;

const SectionTitle = styled.h2`
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.6);
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
`;

const EmptyText = styled.div`
  font-size: 1.1rem;
`;

const Dashboard: React.FC<DashboardProps> = ({
  transfers,
  aiPredictions,
  p2pConnections,
  isOnline
}) => {
  const activeTransfers = transfers.filter(t => t.status === 'transferring');
  const completedTransfers = transfers.filter(t => t.status === 'completed');
  const failedTransfers = transfers.filter(t => t.status === 'failed');
  const connectedPeers = p2pConnections.filter(p => p.connected);

  const totalDataTransferred = completedTransfers.reduce(
    (sum, transfer) => sum + transfer.fileSize,
    0
  );

  const averageSpeed = completedTransfers.length > 0
    ? completedTransfers.reduce((sum, transfer) => sum + (transfer.speed || 0), 0) / completedTransfers.length
    : 0;

  const stats = [
    {
      icon: <Activity size={24} />,
      value: activeTransfers.length,
      label: 'Active Transfers',
      color: '#4ade80'
    },
    {
      icon: <Brain size={24} />,
      value: aiPredictions.length,
      label: 'AI Predictions',
      color: '#8b5cf6'
    },
    {
      icon: <Users size={24} />,
      value: connectedPeers.length,
      label: 'Connected Peers',
      color: '#06b6d4'
    },
    {
      icon: <Zap size={24} />,
      value: `${(averageSpeed / 1024 / 1024).toFixed(1)} MB/s`,
      label: 'Avg Speed',
      color: '#f59e0b'
    },
    {
      icon: <Shield size={24} />,
      value: `${(totalDataTransferred / 1024 / 1024).toFixed(1)} MB`,
      label: 'Data Transferred',
      color: '#10b981'
    },
    {
      icon: <Clock size={24} />,
      value: `${completedTransfers.length}`,
      label: 'Completed',
      color: '#6366f1'
    }
  ];

  return (
    <DashboardContainer>
      <NetworkStatus isOnline={isOnline} />
      
      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <StatIcon style={{ background: stat.color }}>
              {stat.icon}
            </StatIcon>
            <StatContent>
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
            </StatContent>
          </StatCard>
        ))}
      </StatsGrid>

      <AIPerformanceChart predictions={aiPredictions} transfers={transfers} />

      {activeTransfers.length > 0 && (
        <>
          <SectionTitle>
            <Activity size={20} />
            Active Transfers
          </SectionTitle>
          <CardsGrid>
            {activeTransfers.map((transfer) => (
              <TransferCard key={transfer.id} transfer={transfer} />
            ))}
          </CardsGrid>
        </>
      )}

      {aiPredictions.length > 0 && (
        <>
          <SectionTitle>
            <Brain size={20} />
            AI Predictions
          </SectionTitle>
          <CardsGrid>
            {aiPredictions.slice(-5).map((prediction) => (
              <AIPredictionCard key={prediction.id} prediction={prediction} />
            ))}
          </CardsGrid>
        </>
      )}

      {connectedPeers.length > 0 && (
        <>
          <SectionTitle>
            <Users size={20} />
            P2P Connections
          </SectionTitle>
          <CardsGrid>
            {connectedPeers.map((connection) => (
              <P2PConnectionCard key={connection.id} connection={connection} />
            ))}
          </CardsGrid>
        </>
      )}

      {transfers.length === 0 && aiPredictions.length === 0 && connectedPeers.length === 0 && (
        <EmptyState
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <EmptyIcon>
            <Upload size={64} />
          </EmptyIcon>
          <EmptyText>
            Welcome to AeroShare! Start by uploading a file or connecting to peers.
          </EmptyText>
        </EmptyState>
      )}
    </DashboardContainer>
  );
};

export default Dashboard;
