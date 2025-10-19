// Popup Script for AeroShare Chrome Extension
document.addEventListener('DOMContentLoaded', async () => {
  const openAppBtn = document.getElementById('openApp');
  const quickSendBtn = document.getElementById('quickSend');
  const quickReceiveBtn = document.getElementById('quickReceive');
  const recentCodesBtn = document.getElementById('recentCodes');
  const statusDiv = document.getElementById('status');
  const settingsBtn = document.getElementById('settingsBtn');

  // Load settings
  const settings = await chrome.storage.sync.get([
    'theme', 'lastCode', 'notifications', 'encryption', 'hackathonMode'
  ]);

  // Update status
  updateStatus();

  // Event listeners
  openAppBtn.addEventListener('click', () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL('index.html'),
      active: true
    });
    window.close();
  });

  quickSendBtn.addEventListener('click', async () => {
    // Generate a quick code and open app
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await chrome.storage.sync.set({ lastCode: code });
    
    chrome.tabs.create({
      url: chrome.runtime.getURL('index.html') + '#send',
      active: true
    });
    window.close();
  });

  quickReceiveBtn.addEventListener('click', () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL('index.html') + '#receive',
      active: true
    });
    window.close();
  });

  recentCodesBtn.addEventListener('click', async () => {
    const { recentCodes = [] } = await chrome.storage.local.get('recentCodes');
    if (recentCodes.length === 0) {
      statusDiv.textContent = 'No recent codes found';
      statusDiv.style.background = 'rgba(239, 68, 68, 0.1)';
      statusDiv.style.borderColor = 'rgba(239, 68, 68, 0.3)';
      return;
    }
    
    // Show recent codes
    const codesList = recentCodes.slice(0, 3).map(code => 
      `<div style="margin: 4px 0; padding: 4px; background: rgba(255,255,255,0.1); border-radius: 4px; font-family: monospace;">${code}</div>`
    ).join('');
    
    statusDiv.innerHTML = `<div style="font-weight: bold; margin-bottom: 8px;">Recent Codes:</div>${codesList}`;
  });

  settingsBtn.addEventListener('click', () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL('index.html') + '#settings',
      active: true
    });
    window.close();
  });

  // Check for pending shares
  const { pendingShare, pendingFileShare } = await chrome.storage.local.get(['pendingShare', 'pendingFileShare']);
  
  if (pendingShare || pendingFileShare) {
    statusDiv.textContent = 'Content ready to share!';
    statusDiv.style.background = 'rgba(16, 185, 129, 0.1)';
    statusDiv.style.borderColor = 'rgba(16, 185, 129, 0.3)';
  }

  function updateStatus() {
    if (settings.hackathonMode) {
      statusDiv.innerHTML = '🏆 <strong>Hackathon Mode</strong> - Demo Ready';
      statusDiv.style.background = 'rgba(168, 85, 247, 0.1)';
      statusDiv.style.borderColor = 'rgba(168, 85, 247, 0.3)';
    } else if (settings.lastCode) {
      statusDiv.textContent = `Last code: ${settings.lastCode}`;
    } else {
      statusDiv.textContent = 'Ready to transfer files';
    }
  }

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.hackathonMode) {
      updateStatus();
    }
  });
});
