import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Brain, Clock, Target, Zap } from 'lucide-react';
import { AIPrediction } from '../types';

interface AIPredictionCardProps {
  prediction: AIPrediction;
}

const CardContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
`;

const Icon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #8b5cf6, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const Title = styled.div`
  color: white;
  font-weight: 600;
  font-size: 1rem;
`;

const Confidence = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
`;

const Details = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
`;

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
};

const AIPredictionCard: React.FC<AIPredictionCardProps> = ({ prediction }) => {
  return (
    <CardContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Header>
        <Icon>
          <Brain size={20} />
        </Icon>
        <div>
          <Title>AI Prediction</Title>
          <Confidence>Confidence: {(prediction.confidence * 100).toFixed(1)}%</Confidence>
        </div>
      </Header>

      <Details>
        <DetailItem>
          <Target size={14} />
          <span>{formatFileSize(prediction.fileSize)}</span>
        </DetailItem>
        <DetailItem>
          <Clock size={14} />
          <span>{formatTime(prediction.predictedTime)}</span>
        </DetailItem>
        <DetailItem>
          <Zap size={14} />
          <span>{prediction.strategy.parallelChunks} chunks</span>
        </DetailItem>
        <DetailItem>
          <span>{prediction.strategy.compression ? 'Compressed' : 'Raw'}</span>
        </DetailItem>
      </Details>
    </CardContainer>
  );
};

export default AIPredictionCard;
