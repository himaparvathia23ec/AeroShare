import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Components
import Dashboard from './components/Dashboard';
import FileTransfer from './components/FileTransfer';
import VoiceAssistant from './components/VoiceAssistant';
import AIVisualization from './components/AIVisualization';
import P2PManager from './components/P2PManager';
import Navigation from './components/Navigation';

// Hooks
import { useSocket } from './hooks/useSocket';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';

// Types
import { TransferData, AIPrediction, P2PConnection } from './types';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
`;

const MainContent = styled(motion.main)`
  flex: 1;
  display: flex;
  padding: 20px;
  gap: 20px;
`;

const Sidebar = styled(motion.aside)`
  width: 300px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ContentArea = styled(motion.div)`
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow-y: auto;
`;

const Header = styled(motion.header)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 20px 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const Title = styled.h1`
  color: white;
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(45deg, #fff, #e0e0e0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  margin: 10px 0 0 0;
  font-size: 1.1rem;
`;

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [transfers, setTransfers] = useState<TransferData[]>([]);
  const [aiPredictions, setAiPredictions] = useState<AIPrediction[]>([]);
  const [p2pConnections, setP2pConnections] = useState<P2PConnection[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Initialize socket connection
  const socket = useSocket();

  // Initialize voice recognition
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript
  } = useVoiceRecognition();

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    socket.on('transfer-prediction', (prediction: AIPrediction) => {
      setAiPredictions(prev => [...prev, prediction]);
    });

    socket.on('transfer-progress', (progress: any) => {
      setTransfers(prev => 
        prev.map(transfer => 
          transfer.id === progress.transferId 
            ? { ...transfer, progress: progress.progress }
            : transfer
        )
      );
    });

    socket.on('p2p-connected', (connection: P2PConnection) => {
      setP2pConnections(prev => [...prev, connection]);
    });

    socket.on('voice-response', (response: string) => {
      // Handle voice assistant responses
      console.log('Voice response:', response);
    });

    return () => {
      socket.off('transfer-prediction');
      socket.off('transfer-progress');
      socket.off('p2p-connected');
      socket.off('voice-response');
    };
  }, [socket]);

  // Handle voice commands
  useEffect(() => {
    if (transcript) {
      const command = transcript.toLowerCase();
      
      if (command.includes('dashboard')) {
        setCurrentView('dashboard');
      } else if (command.includes('transfer')) {
        setCurrentView('transfer');
      } else if (command.includes('voice')) {
        setCurrentView('voice');
      } else if (command.includes('ai')) {
        setCurrentView('ai');
      } else if (command.includes('p2p')) {
        setCurrentView('p2p');
      }
      
      // Send voice command to server
      if (socket) {
        socket.emit('voice-command', { command: transcript });
      }
      
      resetTranscript();
    }
  }, [transcript, socket, resetTranscript]);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            transfers={transfers}
            aiPredictions={aiPredictions}
            p2pConnections={p2pConnections}
            isOnline={isOnline}
          />
        );
      case 'transfer':
        return (
          <FileTransfer
            onTransferStart={(transfer) => {
              setTransfers(prev => [...prev, transfer]);
              if (socket) {
                socket.emit('file-transfer-start', transfer);
              }
            }}
          />
        );
      case 'voice':
        return (
          <VoiceAssistant
            isListening={isListening}
            transcript={transcript}
            onStartListening={startListening}
            onStopListening={stopListening}
          />
        );
      case 'ai':
        return (
          <AIVisualization
            predictions={aiPredictions}
            transfers={transfers}
          />
        );
      case 'p2p':
        return (
          <P2PManager
            connections={p2pConnections}
            onConnectionChange={setP2pConnections}
          />
        );
      default:
        return <Dashboard
          transfers={transfers}
          aiPredictions={aiPredictions}
          p2pConnections={p2pConnections}
          isOnline={isOnline}
        />;
    }
  };

  return (
    <AppContainer>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
        }}
      />
      
      <Header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title>AeroShare</Title>
        <Subtitle>AI-Powered Smart File Transfer System</Subtitle>
      </Header>

      <MainContent
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Sidebar
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Navigation
            currentView={currentView}
            onViewChange={setCurrentView}
            isOnline={isOnline}
            isListening={isListening}
          />
        </Sidebar>

        <ContentArea
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {renderCurrentView()}
        </ContentArea>
      </MainContent>
    </AppContainer>
  );
}

export default App;
