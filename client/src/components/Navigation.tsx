import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Upload, 
  Mic, 
  Brain, 
  Users, 
  Wifi, 
  WifiOff,
  Settings
} from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isOnline: boolean;
  isListening: boolean;
}

const NavigationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const NavItem = styled(motion.button)<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  border: none;
  border-radius: 12px;
  background: ${props => props.active 
    ? 'rgba(255, 255, 255, 0.2)' 
    : 'rgba(255, 255, 255, 0.05)'
  };
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.active 
    ? 'rgba(255, 255, 255, 0.3)' 
    : 'rgba(255, 255, 255, 0.1)'
  };

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateX(5px);
  }
`;

const NavIcon = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: ${props => props.active ? '#667eea' : 'rgba(255, 255, 255, 0.8)'};
`;

const StatusIndicator = styled.div<{ online: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.online ? '#10b981' : '#ef4444'};
  margin-left: auto;
`;

const ListeningIndicator = styled(motion.div)`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f59e0b;
  margin-left: auto;
`;

const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onViewChange,
  isOnline,
  isListening
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transfer', label: 'File Transfer', icon: Upload },
    { id: 'voice', label: 'Voice Assistant', icon: Mic },
    { id: 'ai', label: 'AI Analytics', icon: Brain },
    { id: 'p2p', label: 'P2P Network', icon: Users },
  ];

  return (
    <NavigationContainer>
      {navItems.map((item, index) => (
        <NavItem
          key={item.id}
          active={currentView === item.id}
          onClick={() => onViewChange(item.id)}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <NavIcon active={currentView === item.id}>
            <item.icon size={20} />
          </NavIcon>
          {item.label}
          {item.id === 'voice' && isListening && (
            <ListeningIndicator
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
          {item.id === 'p2p' && (
            <StatusIndicator online={isOnline} />
          )}
        </NavItem>
      ))}
    </NavigationContainer>
  );
};

export default Navigation;
