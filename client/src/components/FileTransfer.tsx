import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Upload, Mic, MicOff, Send } from 'lucide-react';

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

const UploadArea = styled(motion.div)`
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  padding: 60px 20px;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.1);
  }
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 20px;
`;

const UploadText = styled.div`
  color: white;
  font-size: 1.1rem;
  margin-bottom: 10px;
`;

const UploadSubtext = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

interface FileTransferProps {
  onTransferStart: (transfer: any) => void;
}

const FileTransfer: React.FC<FileTransferProps> = ({ onTransferStart }) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const transfer = {
        id: `transfer_${Date.now()}`,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        progress: 0,
        status: 'pending' as const,
        startTime: Date.now()
      };
      onTransferStart(transfer);
    }
  };

  return (
    <Container>
      <Title>File Transfer</Title>
      
      <UploadArea
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <UploadIcon>
          <Upload size={48} />
        </UploadIcon>
        <UploadText>Drop files here or click to upload</UploadText>
        <UploadSubtext>Supports all file types with AI optimization</UploadSubtext>
        <input
          type="file"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          id="file-upload"
        />
        <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
          <motion.button
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Choose Files
          </motion.button>
        </label>
      </UploadArea>
    </Container>
  );
};

export default FileTransfer;
