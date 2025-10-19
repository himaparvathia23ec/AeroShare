// Content Script for AeroShare Chrome Extension
(function() {
  'use strict';

  // Detect file elements on page
  function detectFiles() {
    const fileElements = document.querySelectorAll('input[type="file"], [data-file], .file-item, .attachment');
    return Array.from(fileElements);
  }

  // Add AeroShare share button to file elements
  function addShareButtons() {
    const fileElements = detectFiles();
    
    fileElements.forEach(element => {
      if (element.dataset.aeroshareAdded) return;
      
      const shareBtn = document.createElement('button');
      shareBtn.innerHTML = '🚀 Share via AeroShare';
      shareBtn.style.cssText = `
        background: linear-gradient(135deg, #0ea5e9, #2563eb);
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        margin-left: 8px;
        transition: all 0.2s ease;
      `;
      
      shareBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleFileShare(element);
      });
      
      // Insert button after element
      element.parentNode.insertBefore(shareBtn, element.nextSibling);
      element.dataset.aeroshareAdded = 'true';
    });
  }

  // Handle file sharing
  async function handleFileShare(element) {
    try {
      let fileData = null;
      
      if (element.type === 'file' && element.files.length > 0) {
        const file = element.files[0];
        fileData = {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        };
      } else if (element.dataset.file) {
        fileData = JSON.parse(element.dataset.file);
      } else {
        // Try to extract file info from element
        const fileName = element.textContent || element.alt || 'unknown';
        fileData = {
          name: fileName,
          size: 0,
          type: 'unknown',
          lastModified: Date.now()
        };
      }
      
      // Send to background script
      chrome.runtime.sendMessage({
        action: 'shareFile',
        fileData: fileData
      });
      
    } catch (error) {
      console.error('AeroShare: Error sharing file', error);
    }
  }

  // Initialize
  function init() {
    addShareButtons();
    
    // Re-scan periodically for new file elements
    setInterval(addShareButtons, 2000);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'webrtc-signal') {
      // Handle WebRTC signaling
      handleWebRTCSignal(request.data);
    }
  });

  function handleWebRTCSignal(data) {
    // WebRTC signaling logic would go here
    console.log('AeroShare: WebRTC signal received', data);
  }

})();
