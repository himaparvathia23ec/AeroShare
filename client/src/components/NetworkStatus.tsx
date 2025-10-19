import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';

interface NetworkStatusProps {
  isOnline: boolean;
}

const StatusContainer = styled(motion.div)<{ online: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 20px;
  border-radius: 12px;
  background: ${props => props.online 
    ? 'rgba(16, 185, 129, 0.2)' 
    : 'rgba(239, 68, 68, 0.2)'
  };
  border: 1px solid ${props => props.online 
    ? 'rgba(16, 185, 129, 0.3)' 
    : 'rgba(239, 68, 68, 0.3)'
  };
  color: white;
  font-weight: 500;
`;

const StatusIcon = styled.div<{ online: boolean }>`
  color: ${props => props.online ? '#10b981' : '#ef4444'};
`;

const StatusText = styled.div`
  font-size: 0.9rem;
`;

const NetworkStatus: React.FC<NetworkStatusProps> = ({ isOnline }) => {
  return (
    <StatusContainer
      online={isOnline}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <StatusIcon online={isOnline}>
        {isOnline ? <Wifi size={20} /> : <WifiOff size={20} />}
      </StatusIcon>
      <StatusText>
        {isOnline ? 'Online - Server Connected' : 'Offline - P2P Mode'}
      </StatusText>
    </StatusContainer>
  );
};

export default NetworkStatus;
