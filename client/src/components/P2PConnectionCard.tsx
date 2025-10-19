import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Users, Wifi, WifiOff } from 'lucide-react';
import { P2PConnection } from '../types';

interface P2PConnectionCardProps {
  connection: P2PConnection;
}

const CardContainer = styled(motion.div)<{ connected: boolean }>`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  border: 1px solid ${props => props.connected 
    ? 'rgba(16, 185, 129, 0.3)' 
    : 'rgba(255, 255, 255, 0.2)'
  };
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
`;

const Icon = styled.div<{ connected: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.connected 
    ? 'linear-gradient(135deg, #10b981, #059669)' 
    : 'linear-gradient(135deg, #6b7280, #4b5563)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const Info = styled.div`
  flex: 1;
`;

const UserId = styled.div`
  color: white;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 5px;
`;

const DeviceInfo = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
`;

const StatusIndicator = styled.div<{ connected: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.connected ? '#10b981' : '#ef4444'};
`;

const P2PConnectionCard: React.FC<P2PConnectionCardProps> = ({ connection }) => {
  return (
    <CardContainer
      connected={connection.connected}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Header>
        <Icon connected={connection.connected}>
          <Users size={20} />
        </Icon>
        <Info>
          <UserId>{connection.userId}</UserId>
          <DeviceInfo>{connection.deviceInfo.platform}</DeviceInfo>
        </Info>
        <StatusIndicator connected={connection.connected} />
      </Header>
    </CardContainer>
  );
};

export default P2PConnectionCard;
