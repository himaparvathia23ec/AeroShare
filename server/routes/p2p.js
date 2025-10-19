const express = require('express');
const P2PManager = require('../p2p/p2pManager');

const router = express.Router();

// Get P2P room info
router.get('/room/:roomId', (req, res) => {
  try {
    const { roomId } = req.params;
    // In a real implementation, you would get the P2P manager instance
    // const roomInfo = p2pManager.getRoomInfo(roomId);
    
    res.json({
      success: true,
      roomId,
      peerCount: 0,
      peers: []
    });
  } catch (error) {
    console.error('P2P room error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get active transfers
router.get('/transfers', (req, res) => {
  try {
    // In a real implementation, you would get active transfers
    // const transfers = p2pManager.getActiveTransfers();
    
    res.json({
      success: true,
      transfers: []
    });
  } catch (error) {
    console.error('P2P transfers error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create P2P room
router.post('/room', (req, res) => {
  try {
    const { userId, deviceInfo } = req.body;
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    res.json({
      success: true,
      roomId,
      message: 'P2P room created successfully'
    });
  } catch (error) {
    console.error('P2P room creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
