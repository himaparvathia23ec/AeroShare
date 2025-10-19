import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Users, Wifi, WifiOff, Plus, Settings } from 'lucide-react';
import { P2PConnection } from '../types';

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

const ControlPanel = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Button = styled(motion.button)`
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ConnectionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
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

interface P2PManagerProps {
  connections: P2PConnection[];
  onConnectionChange: (connections: P2PConnection[]) => void;
}

const P2PManager: React.FC<P2PManagerProps> = ({ connections, onConnectionChange }) => {
  const handleCreateRoom = () => {
    const roomId = `room_${Date.now()}`;
    // In a real implementation, this would create a P2P room
    console.log('Creating P2P room:', roomId);
  };

  const handleJoinRoom = () => {
    const roomId = prompt('Enter room ID:');
    if (roomId) {
      // In a real implementation, this would join a P2P room
      console.log('Joining P2P room:', roomId);
    }
  };

  return (
    <Container>
      <Title>P2P Network Manager</Title>
      
      <ControlPanel
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <Button
            onClick={handleCreateRoom}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} />
            Create Room
          </Button>
          <Button
            onClick={handleJoinRoom}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Users size={20} />
            Join Room
          </Button>
        </div>

        <div style={{ color: 'white', fontSize: '1rem', marginBottom: '20px' }}>
          Active Connections: {connections.filter(c => c.connected).length}
        </div>
      </ControlPanel>

      {connections.length > 0 ? (
        <ConnectionsList>
          {connections.map((connection) => (
            <motion.div
              key={connection.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: connection.connected 
                  ? 'linear-gradient(135deg, #10b981, #059669)' 
                  : 'linear-gradient(135deg, #6b7280, #4b5563)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <Users size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'white', fontWeight: '600', fontSize: '1rem' }}>
                  {connection.userId}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>
                  {connection.deviceInfo.platform} • Room: {connection.roomId}
                </div>
              </div>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: connection.connected ? '#10b981' : '#ef4444'
              }} />
            </motion.div>
          ))}
        </ConnectionsList>
      ) : (
        <EmptyState
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <EmptyIcon>
            <Users size={64} />
          </EmptyIcon>
          <EmptyText>
            No P2P connections yet. Create or join a room to start peer-to-peer transfers.
          </EmptyText>
        </EmptyState>
      )}
    </Container>
  );
};

export default P2PManager;
