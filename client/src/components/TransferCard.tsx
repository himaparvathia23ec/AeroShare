import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { File, Clock, Zap, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { TransferData } from '../types';

interface TransferCardProps {
  transfer: TransferData;
}

const CardContainer = styled(motion.div)<{ status: string }>`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
`;

const FileIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const FileInfo = styled.div`
  flex: 1;
`;

const FileName = styled.div`
  color: white;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 5px;
`;

const FileSize = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
`;

const StatusIcon = styled.div<{ status: string }>`
  color: ${props => {
    switch (props.status) {
      case 'completed': return '#10b981';
      case 'failed': return '#ef4444';
      case 'transferring': return '#f59e0b';
      default: return '#6b7280';
    }
  }};
`;

const ProgressContainer = styled.div`
  margin-bottom: 15px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled(motion.div)<{ progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 3px;
  width: ${props => props.progress}%;
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
`;

const TransferDetails = styled.div`
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

const formatSpeed = (bytesPerSecond: number): string => {
  return formatFileSize(bytesPerSecond) + '/s';
};

const formatDuration = (startTime: number, endTime?: number): string => {
  const duration = (endTime || Date.now()) - startTime;
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

const TransferCard: React.FC<TransferCardProps> = ({ transfer }) => {
  const getStatusIcon = () => {
    switch (transfer.status) {
      case 'completed':
        return <CheckCircle size={16} />;
      case 'failed':
        return <XCircle size={16} />;
      case 'transferring':
        return <Zap size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  return (
    <CardContainer
      status={transfer.status}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <CardHeader>
        <FileIcon>
          <File size={20} />
        </FileIcon>
        <FileInfo>
          <FileName>{transfer.fileName}</FileName>
          <FileSize>{formatFileSize(transfer.fileSize)}</FileSize>
        </FileInfo>
        <StatusIcon status={transfer.status}>
          {getStatusIcon()}
        </StatusIcon>
      </CardHeader>

      <ProgressContainer>
        <ProgressBar>
          <ProgressFill
            progress={transfer.progress}
            initial={{ width: 0 }}
            animate={{ width: transfer.progress }}
            transition={{ duration: 0.5 }}
          />
        </ProgressBar>
        <ProgressText>
          <span>{transfer.progress.toFixed(1)}%</span>
          <span>{transfer.status}</span>
        </ProgressText>
      </ProgressContainer>

      <TransferDetails>
        <DetailItem>
          <Clock size={14} />
          <span>{formatDuration(transfer.startTime, transfer.endTime)}</span>
        </DetailItem>
        {transfer.speed && (
          <DetailItem>
            <Zap size={14} />
            <span>{formatSpeed(transfer.speed)}</span>
          </DetailItem>
        )}
      </TransferDetails>

      {transfer.error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{
            marginTop: '15px',
            padding: '10px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#ef4444',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertCircle size={14} />
          {transfer.error}
        </motion.div>
      )}
    </CardContainer>
  );
};

export default TransferCard;
