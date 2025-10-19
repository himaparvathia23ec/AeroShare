export interface TransferData {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  progress: number;
  status: 'pending' | 'transferring' | 'completed' | 'failed';
  startTime: number;
  endTime?: number;
  speed?: number;
  error?: string;
}

export interface AIPrediction {
  id: string;
  fileSize: number;
  fileType: string;
  predictedTime: number;
  strategy: TransferStrategy;
  confidence: number;
  timestamp: number;
}

export interface TransferStrategy {
  chunkSize: number;
  compression: boolean;
  parallelChunks: number;
  retryAttempts: number;
  adaptiveSpeed: boolean;
  errorCorrection: boolean;
}

export interface P2PConnection {
  id: string;
  peerId: string;
  userId: string;
  deviceInfo: DeviceInfo;
  connected: boolean;
  roomId: string;
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
  timezone: string;
}

export interface VoiceCommand {
  command: string;
  timestamp: number;
  confidence: number;
}

export interface NetworkConditions {
  bandwidth: number;
  latency: number;
  packetLoss: number;
}

export interface FileChunk {
  index: number;
  data: string;
  checksum: string;
}

export interface TransferProgress {
  transferId: string;
  progress: number;
  speed: number;
  eta: number;
  errors: string[];
}
