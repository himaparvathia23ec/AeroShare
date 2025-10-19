import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { TrendingUp, Activity } from 'lucide-react';
import { AIPrediction, TransferData } from '../types';

const Container = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Title = styled.div`
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ChartPlaceholder = styled.div`
  height: 200px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
  border: 1px dashed rgba(255, 255, 255, 0.2);
`;

interface AIPerformanceChartProps {
  predictions: AIPrediction[];
  transfers: TransferData[];
}

const AIPerformanceChart: React.FC<AIPerformanceChartProps> = ({ predictions, transfers }) => {
  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Title>
        <Activity size={24} />
        AI Performance Overview
      </Title>
      <ChartPlaceholder>
        Real-time AI performance metrics and predictions visualization
      </ChartPlaceholder>
    </Container>
  );
};

export default AIPerformanceChart;
