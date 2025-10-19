import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Activity } from 'lucide-react';
import { AIPrediction, TransferData } from '../types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const Title = styled.h2`
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
`;

const ChartArea = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ChartTitle = styled.div`
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PlaceholderChart = styled.div`
  height: 300px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.1rem;
  border: 1px dashed rgba(255, 255, 255, 0.2);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
`;

const StatValue = styled.div`
  color: white;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

interface AIVisualizationProps {
  predictions: AIPrediction[];
  transfers: TransferData[];
}

const AIVisualization: React.FC<AIVisualizationProps> = ({ predictions, transfers }) => {
  const completedTransfers = transfers.filter(t => t.status === 'completed');
  const avgAccuracy = predictions.length > 0 
    ? predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length 
    : 0;
  
  const totalPredictions = predictions.length;
  const successfulPredictions = predictions.filter(p => p.confidence > 0.8).length;

  return (
    <Container>
      <Title>AI Analytics & Visualization</Title>
      
      <ChartArea
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ChartTitle>
          <Brain size={24} />
          AI Performance Metrics
        </ChartTitle>
        <PlaceholderChart>
          Real-time AI performance charts will be displayed here
        </PlaceholderChart>
      </ChartArea>

      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <StatValue>{(avgAccuracy * 100).toFixed(1)}%</StatValue>
          <StatLabel>Average Accuracy</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <StatValue>{totalPredictions}</StatValue>
          <StatLabel>Total Predictions</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <StatValue>{successfulPredictions}</StatValue>
          <StatLabel>Successful Predictions</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <StatValue>{completedTransfers.length}</StatValue>
          <StatLabel>Completed Transfers</StatLabel>
        </StatCard>
      </StatsGrid>
    </Container>
  );
};

export default AIVisualization;
