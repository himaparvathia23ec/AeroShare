const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs-extra');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// AI Engine
const AIEngine = require('./ai/aiEngine');
const P2PManager = require('./p2p/p2pManager');
const VoiceAssistant = require('./voice/voiceAssistant');
const FileProcessor = require('./utils/fileProcessor');

// Initialize components
const aiEngine = new AIEngine();
const p2pManager = new P2PManager(io);
const voiceAssistant = new VoiceAssistant();
const fileProcessor = new FileProcessor();

// Routes
app.use('/api/files', require('./routes/files'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/p2p', require('./routes/p2p'));
app.use('/api/voice', require('./routes/voice'));

// Serve static files
app.use(express.static(path.join(__dirname, '../client/build')));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Join P2P room
  socket.on('join-p2p', (data) => {
    p2pManager.handleJoin(socket, data);
  });
  
  // File transfer events
  socket.on('file-transfer-start', (data) => {
    aiEngine.predictTransfer(data);
    socket.emit('transfer-prediction', aiEngine.getPrediction());
  });
  
  socket.on('file-transfer-progress', (data) => {
    aiEngine.updateProgress(data);
    socket.emit('ai-optimization', aiEngine.getOptimization());
  });
  
  socket.on('voice-command', (data) => {
    voiceAssistant.processCommand(data, socket);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    p2pManager.handleDisconnect(socket);
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`AeroShare server running on port ${PORT}`);
  console.log('AI Engine initialized');
  console.log('P2P Manager ready');
  console.log('Voice Assistant active');
});
