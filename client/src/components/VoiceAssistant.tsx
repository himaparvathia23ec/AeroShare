import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Mic, MicOff, Send, Volume2 } from 'lucide-react';

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

const VoiceArea = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 40px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const VoiceIcon = styled(motion.div)<{ listening: boolean }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${props => props.listening 
    ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
    : 'linear-gradient(135deg, #667eea, #764ba2)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 30px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
`;

const VoiceText = styled.div`
  color: white;
  font-size: 1.2rem;
  margin-bottom: 20px;
`;

const TranscriptArea = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 20px;
  margin: 20px 0;
  min-height: 100px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const TranscriptText = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  line-height: 1.5;
`;

const CommandsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 30px;
`;

const CommandItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const CommandText = styled.div`
  color: white;
  font-weight: 600;
  margin-bottom: 5px;
`;

const CommandDesc = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
`;

interface VoiceAssistantProps {
  isListening: boolean;
  transcript: string;
  onStartListening: () => void;
  onStopListening: () => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  isListening,
  transcript,
  onStartListening,
  onStopListening
}) => {
  const handleVoiceToggle = () => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  const commands = [
    { command: "Show dashboard", description: "Navigate to main dashboard" },
    { command: "Start transfer", description: "Begin file transfer" },
    { command: "Show AI analytics", description: "View AI predictions" },
    { command: "Connect P2P", description: "Join peer-to-peer network" },
    { command: "Check status", description: "View transfer status" },
    { command: "Pause transfer", description: "Pause current transfers" }
  ];

  return (
    <Container>
      <Title>Voice Assistant</Title>
      
      <VoiceArea
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <VoiceIcon
          listening={isListening}
          onClick={handleVoiceToggle}
          animate={isListening ? { scale: [1, 1.1, 1] } : { scale: 1 }}
          transition={isListening ? { duration: 1, repeat: Infinity } : {}}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isListening ? <MicOff size={48} /> : <Mic size={48} />}
        </VoiceIcon>
        
        <VoiceText>
          {isListening ? 'Listening... Click to stop' : 'Click to start voice commands'}
        </VoiceText>

        <TranscriptArea>
          <TranscriptText>
            {transcript || 'Your voice commands will appear here...'}
          </TranscriptText>
        </TranscriptArea>
      </VoiceArea>

      <CommandsList>
        {commands.map((cmd, index) => (
          <CommandItem key={index}>
            <CommandText>"{cmd.command}"</CommandText>
            <CommandDesc>{cmd.description}</CommandDesc>
          </CommandItem>
        ))}
      </CommandsList>
    </Container>
  );
};

export default VoiceAssistant;
