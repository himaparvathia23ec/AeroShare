const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const FileProcessor = require('../utils/fileProcessor');

const router = express.Router();
const fileProcessor = new FileProcessor();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Upload file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileInfo = await fileProcessor.processFile(req.file.path);
    
    res.json({
      success: true,
      file: fileInfo,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get file info
router.get('/info/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const filePath = path.join(__dirname, '../../uploads', fileId);
    
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const fileInfo = await fileProcessor.processFile(filePath);
    res.json(fileInfo);
  } catch (error) {
    console.error('File info error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download file
router.get('/download/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const filePath = path.join(__dirname, '../../uploads', fileId);
    
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const fileInfo = await fileProcessor.processFile(filePath);
    
    res.download(filePath, fileInfo.fileName);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get file preview
router.get('/preview/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const filePath = path.join(__dirname, '../../uploads', fileId);
    
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const preview = await fileProcessor.getFilePreview(filePath);
    res.json(preview);
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete file
router.delete('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const filePath = path.join(__dirname, '../../uploads', fileId);
    
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    await fs.remove(filePath);
    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get supported file types
router.get('/types', (req, res) => {
  try {
    const supportedTypes = fileProcessor.getSupportedTypes();
    res.json(supportedTypes);
  } catch (error) {
    console.error('Types error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
