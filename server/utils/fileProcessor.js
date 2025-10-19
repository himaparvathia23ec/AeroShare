const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const mime = require('mime-types');

class FileProcessor {
  constructor() {
    this.supportedTypes = {
      image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'],
      video: ['mp4', 'avi', 'mov', 'wmv', 'webm', 'mkv'],
      audio: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'],
      document: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'],
      archive: ['zip', 'rar', '7z', 'tar', 'gz'],
      code: ['js', 'ts', 'html', 'css', 'py', 'java', 'cpp', 'c'],
      data: ['json', 'xml', 'csv', 'xlsx', 'xls']
    };
  }

  // Process file metadata
  async processFile(filePath) {
    try {
      const stats = await fs.stat(filePath);
      const ext = path.extname(filePath).toLowerCase().slice(1);
      const mimeType = mime.lookup(filePath) || 'application/octet-stream';
      
      return {
        fileName: path.basename(filePath),
        filePath: filePath,
        fileSize: stats.size,
        fileType: mimeType,
        extension: ext,
        category: this.categorizeFile(ext),
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        checksum: await this.calculateChecksum(filePath)
      };
    } catch (error) {
      throw new Error(`Failed to process file: ${error.message}`);
    }
  }

  // Categorize file by extension
  categorizeFile(extension) {
    for (const [category, extensions] of Object.entries(this.supportedTypes)) {
      if (extensions.includes(extension.toLowerCase())) {
        return category;
      }
    }
    return 'other';
  }

  // Calculate file checksum
  async calculateChecksum(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('md5');
      const stream = fs.createReadStream(filePath);
      
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  // Validate file
  validateFile(filePath, maxSize = 100 * 1024 * 1024) { // 100MB default
    return new Promise(async (resolve, reject) => {
      try {
        const stats = await fs.stat(filePath);
        
        if (stats.size > maxSize) {
          reject(new Error(`File size exceeds maximum allowed size of ${maxSize} bytes`));
          return;
        }
        
        if (!stats.isFile()) {
          reject(new Error('Path does not point to a file'));
          return;
        }
        
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Create file chunks
  createChunks(filePath, chunkSize = 64 * 1024) {
    return new Promise(async (resolve, reject) => {
      try {
        const fileBuffer = await fs.readFile(filePath);
        const chunks = [];
        const totalChunks = Math.ceil(fileBuffer.length / chunkSize);
        
        for (let i = 0; i < totalChunks; i++) {
          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, fileBuffer.length);
          const chunk = fileBuffer.slice(start, end);
          
          chunks.push({
            index: i,
            data: chunk,
            size: chunk.length,
            checksum: crypto.createHash('md5').update(chunk).digest('hex')
          });
        }
        
        resolve(chunks);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Reconstruct file from chunks
  async reconstructFile(chunks, outputPath) {
    try {
      // Sort chunks by index
      chunks.sort((a, b) => a.index - b.index);
      
      // Combine all chunk data
      const buffers = chunks.map(chunk => Buffer.from(chunk.data));
      const fileBuffer = Buffer.concat(buffers);
      
      // Write to output path
      await fs.writeFile(outputPath, fileBuffer);
      
      return {
        filePath: outputPath,
        fileSize: fileBuffer.length,
        chunksProcessed: chunks.length
      };
    } catch (error) {
      throw new Error(`Failed to reconstruct file: ${error.message}`);
    }
  }

  // Compress file (placeholder for actual compression)
  async compressFile(inputPath, outputPath, quality = 0.8) {
    try {
      // In a real implementation, you would use compression libraries
      // like sharp for images, ffmpeg for videos, etc.
      const fileBuffer = await fs.readFile(inputPath);
      
      // Simple placeholder compression (just copy for now)
      await fs.writeFile(outputPath, fileBuffer);
      
      return {
        originalSize: fileBuffer.length,
        compressedSize: fileBuffer.length,
        compressionRatio: 1.0
      };
    } catch (error) {
      throw new Error(`Failed to compress file: ${error.message}`);
    }
  }

  // Get file preview (for images, documents, etc.)
  async getFilePreview(filePath, maxSize = 1024 * 1024) { // 1MB max preview
    try {
      const stats = await fs.stat(filePath);
      const ext = path.extname(filePath).toLowerCase().slice(1);
      
      if (stats.size > maxSize) {
        return { type: 'too_large', message: 'File too large for preview' };
      }
      
      if (this.supportedTypes.image.includes(ext)) {
        return { type: 'image', data: await fs.readFile(filePath) };
      }
      
      if (this.supportedTypes.document.includes(ext)) {
        const content = await fs.readFile(filePath, 'utf8');
        return { type: 'text', data: content.slice(0, 1000) }; // First 1000 chars
      }
      
      return { type: 'unsupported', message: 'Preview not available for this file type' };
    } catch (error) {
      throw new Error(`Failed to generate preview: ${error.message}`);
    }
  }

  // Clean up temporary files
  async cleanupTempFiles(tempDir) {
    try {
      const files = await fs.readdir(tempDir);
      for (const file of files) {
        await fs.remove(path.join(tempDir, file));
      }
    } catch (error) {
      console.error('Failed to cleanup temp files:', error);
    }
  }

  // Get supported file types
  getSupportedTypes() {
    return this.supportedTypes;
  }

  // Check if file type is supported
  isSupportedType(extension) {
    const allExtensions = Object.values(this.supportedTypes).flat();
    return allExtensions.includes(extension.toLowerCase());
  }
}

module.exports = FileProcessor;
