const express = require('express');
const VoiceAssistant = require('../voice/voiceAssistant');

const router = express.Router();
const voiceAssistant = new VoiceAssistant();

// Process voice command
router.post('/command', (req, res) => {
  try {
    const { command } = req.body;
    
    if (!command) {
      return res.status(400).json({ error: 'No command provided' });
    }

    // Mock socket for voice assistant
    const mockSocket = {
      emit: (event, data) => {
        console.log(`Socket emit: ${event}`, data);
      }
    };

    const response = voiceAssistant.processCommand({ command }, mockSocket);
    
    res.json({
      success: true,
      command,
      response,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Voice command error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get available commands
router.get('/commands', (req, res) => {
  try {
    const commands = voiceAssistant.getAvailableCommands();
    res.json({
      success: true,
      commands
    });
  } catch (error) {
    console.error('Voice commands error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
