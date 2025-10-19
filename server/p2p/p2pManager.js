const EventEmitter = require('events');
const crypto = require('crypto');

class P2PManager extends EventEmitter {
  constructor(io) {
    super();
    this.io = io;
    this.peers = new Map();
    this.rooms = new Map();
    this.transfers = new Map();
  }

  // Handle peer joining P2P room
  handleJoin(socket, data) {
    const { roomId, userId, deviceInfo } = data;
    
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Map());
    }
    
    const room = this.rooms.get(roomId);
    room.set(socket.id, {
      socket,
      userId,
      deviceInfo,
      connected: false
    });
    
    socket.join(roomId);
    socket.emit('p2p-joined', { roomId, peerId: socket.id });
    
    // Notify other peers in room
    socket.to(roomId).emit('peer-joined', {
      peerId: socket.id,
      userId,
      deviceInfo
    });
    
    console.log(`Peer ${socket.id} joined room ${roomId}`);
  }

  // Handle peer disconnection
  handleDisconnect(socket) {
    const roomId = this.findRoomBySocket(socket);
    if (roomId) {
      const room = this.rooms.get(roomId);
      if (room) {
        room.delete(socket.id);
        socket.to(roomId).emit('peer-left', { peerId: socket.id });
        
        if (room.size === 0) {
          this.rooms.delete(roomId);
        }
      }
    }
    
    this.peers.delete(socket.id);
    console.log(`Peer ${socket.id} disconnected`);
  }

  // Find room by socket
  findRoomBySocket(socket) {
    for (const [roomId, room] of this.rooms) {
      if (room.has(socket.id)) {
        return roomId;
      }
    }
    return null;
  }

  // Get room information
  getRoomInfo(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    
    const peers = Array.from(room.values()).map(peer => ({
      id: peer.socket.id,
      userId: peer.userId,
      deviceInfo: peer.deviceInfo,
      connected: peer.connected
    }));
    
    return {
      roomId,
      peerCount: room.size,
      peers
    };
  }
}

module.exports = P2PManager;
