# AeroShare: AI-Powered Smart File Transfer System

AeroShare is a cutting-edge, AI-powered smart file transfer system designed as a unified ecosystem accessible via a central web hub. The platform delivers on its core promise to predict, prioritize, and securely transfer files with adaptive speed optimization and real-time error correction, while ensuring full functionality with or without an internet connection through intelligent offline P2P mode.

## 🚀 Features

### Core Capabilities
- **AI-Powered Predictions**: Intelligent file transfer time prediction and optimization
- **Adaptive Speed Optimization**: Real-time error correction and speed adjustment
- **Offline P2P Mode**: Peer-to-peer file transfers without internet dependency
- **Universal File Support**: Handles all data types (images, videos, PDFs, documents, etc.)
- **Voice Assistant**: Hands-free voice commands for transfer management
- **Real-time Dashboard**: Interactive visualization of AI operations and transfer status

### Technical Highlights
- **WebRTC P2P**: Direct peer-to-peer connections for offline transfers
- **AI Engine**: Machine learning-based transfer optimization
- **Voice Recognition**: Speech-to-text command processing
- **Real-time Updates**: WebSocket-based live data streaming
- **Modern UI**: React with TypeScript and styled-components
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Architecture

```
AeroShare/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # React Components
│   │   ├── hooks/          # Custom Hooks
│   │   ├── types/          # TypeScript Types
│   │   └── utils/          # Utility Functions
│   └── public/             # Static Assets
├── server/                 # Node.js Backend
│   ├── ai/                 # AI Engine
│   ├── p2p/                # P2P Manager
│   ├── voice/              # Voice Assistant
│   ├── routes/             # API Routes
│   └── utils/              # Utility Functions
└── package.json            # Root Configuration
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Modern web browser with WebRTC support

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aeroshare
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Manual Setup

1. **Backend Setup**
   ```bash
   cd server
   npm install
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   cd client
   npm install
   npm start
   ```

## 🎯 Usage

### Getting Started

1. **Open AeroShare** in your web browser
2. **Grant microphone permissions** for voice commands
3. **Upload files** using the drag-and-drop interface
4. **Monitor transfers** in real-time on the dashboard

### Voice Commands

AeroShare supports hands-free operation through voice commands:

- "Show dashboard" - Navigate to main dashboard
- "Start transfer" - Begin file transfer process
- "Show AI analytics" - View AI predictions and metrics
- "Connect P2P" - Join peer-to-peer network
- "Check status" - View current transfer status
- "Pause transfer" - Pause active transfers
- "Resume transfer" - Resume paused transfers
- "Help" - Show available commands

### P2P Offline Mode

1. **Create a room** or join an existing one
2. **Share room ID** with other users
3. **Transfer files** directly between peers
4. **No internet required** for P2P transfers

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the server directory:

```env
PORT=5000
NODE_ENV=development
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
```

### AI Engine Settings

Modify AI optimization rules in `server/ai/aiEngine.js`:

```javascript
this.optimizationRules = {
  image: { priority: 1, chunkSize: 64 * 1024, compression: true },
  video: { priority: 2, chunkSize: 128 * 1024, compression: false },
  document: { priority: 3, chunkSize: 32 * 1024, compression: true },
  // ... more rules
};
```

## 📊 API Documentation

### File Transfer API

- `POST /api/files/upload` - Upload a file
- `GET /api/files/info/:fileId` - Get file information
- `GET /api/files/download/:fileId` - Download a file
- `GET /api/files/preview/:fileId` - Get file preview
- `DELETE /api/files/:fileId` - Delete a file

### AI Engine API

- `POST /api/ai/predict` - Get AI prediction for transfer
- `POST /api/ai/progress` - Update transfer progress
- `GET /api/ai/optimization` - Get current optimization settings
- `GET /api/ai/prediction` - Get latest prediction

### P2P Network API

- `GET /api/p2p/room/:roomId` - Get room information
- `POST /api/p2p/room` - Create new P2P room
- `GET /api/p2p/transfers` - Get active transfers

### Voice Assistant API

- `POST /api/voice/command` - Process voice command
- `GET /api/voice/commands` - Get available commands

## 🔒 Security Features

- **File Validation**: Comprehensive file type and size checking
- **Checksum Verification**: MD5 checksums for data integrity
- **Secure Uploads**: Temporary file handling with cleanup
- **Input Sanitization**: Protection against malicious inputs
- **CORS Configuration**: Proper cross-origin resource sharing

## 🎨 UI Components

### Dashboard
- Real-time transfer monitoring
- AI performance metrics
- Network status indicators
- P2P connection management

### File Transfer
- Drag-and-drop interface
- Progress visualization
- Error handling and recovery
- Transfer history

### Voice Assistant
- Speech recognition
- Command processing
- Visual feedback
- Help system

### AI Analytics
- Performance charts
- Prediction accuracy
- Optimization metrics
- Historical data

## 🚀 Deployment

### Production Build

1. **Build the frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Start production server**
   ```bash
   cd server
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔮 Future Enhancements

- **Machine Learning Models**: Advanced AI prediction algorithms
- **Compression Engine**: Real-time file compression
- **Mobile App**: Native mobile applications
- **Cloud Integration**: Cloud storage providers
- **Advanced Analytics**: Detailed performance metrics
- **Multi-language Support**: Internationalization

---

**AeroShare** - Revolutionizing file transfer with AI intelligence and peer-to-peer technology.
