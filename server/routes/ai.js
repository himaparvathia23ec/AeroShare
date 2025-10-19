const express = require('express');
const AIEngine = require('../ai/aiEngine');

const router = express.Router();
const aiEngine = new AIEngine();

// Get AI prediction
router.post('/predict', (req, res) => {
  try {
    const { fileSize, fileType, networkSpeed, deviceType } = req.body;
    
    if (!fileSize || !fileType) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const prediction = aiEngine.predictTransfer({
      fileSize,
      fileType,
      networkSpeed,
      deviceType
    });

    res.json({
      success: true,
      prediction
    });
  } catch (error) {
    console.error('AI prediction error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update transfer progress
router.post('/progress', (req, res) => {
  try {
    const { transferId, bytesTransferred, totalBytes, speed, errors } = req.body;
    
    const optimization = aiEngine.updateProgress({
      transferId,
      bytesTransferred,
      totalBytes,
      speed,
      errors
    });

    res.json({
      success: true,
      optimization
    });
  } catch (error) {
    console.error('AI progress error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get AI optimization
router.get('/optimization', (req, res) => {
  try {
    const optimization = aiEngine.getOptimization();
    res.json(optimization);
  } catch (error) {
    console.error('AI optimization error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get latest prediction
router.get('/prediction', (req, res) => {
  try {
    const prediction = aiEngine.getPrediction();
    res.json(prediction);
  } catch (error) {
    console.error('AI prediction error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
