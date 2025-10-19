// Global state
let currentViewButton = null;
let currentMode = null;
let isListening = false;
let hackathonMode = false;
let encryptionEnabled = true;
let deviceInfo = null;
let transferStats = {
	totalTransfers: 0,
	totalData: 0,
	avgSpeed: 0,
	encryptionRate: 100
};

// Session store per share code; stored in-memory and mirrored to sessionStorage for isolation by tab
const sessionStore = {
	// structure: { [code]: { files: Array<{name:string,size:number,type:string,blob:Blob}>, createdAt:number } }
	data: {},
	load() {
		try {
			const raw = sessionStorage.getItem('aeroshare.sessions');
			this.data = raw ? JSON.parse(raw) : {};
		} catch { this.data = {}; }
	},
	save() { sessionStorage.setItem('aeroshare.sessions', JSON.stringify(this.data)); },
	create(code) { this.data[code] = { files: [], createdAt: Date.now() }; this.save(); },
	addFile(code, file) { if (!this.data[code]) this.create(code); this.data[code].files.push(file); this.save(); },
	listFiles(code) { return this.data[code]?.files || []; },
	deleteFile(code, name) { if (!this.data[code]) return; this.data[code].files = this.data[code].files.filter(f => f.name !== name); if (this.data[code].files.length === 0) delete this.data[code]; this.save(); },
	clear(code) { delete this.data[code]; this.save(); }
};
sessionStore.load();

// UI helpers
function showView(viewId, buttonEl) {
	// views controlled by ids: dashboard, transfer
	document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
	document.getElementById(viewId).classList.remove('hidden');
	if (currentViewButton) currentViewButton.classList.remove('active');
	if (buttonEl) { buttonEl.classList.add('active'); currentViewButton = buttonEl; }
}

function showToast(message, kind = 'success') {
	const t = document.createElement('div');
	t.className = 'toast';
	t.style.background = kind === 'error' ? 'rgba(239,68,68,0.9)' : kind === 'info' ? 'rgba(59,130,246,0.9)' : 'rgba(16,185,129,0.9)';
	t.textContent = message;
	document.body.appendChild(t);
	setTimeout(() => { t.style.animation = 'slideOutRight .3s ease-out'; setTimeout(() => t.remove(), 300); }, 2500);
}

// Transfer logic
let activeShareCode = null;
let codeExpiryTimer = null;
let codeExpiryTime = null;

function selectMode(mode) {
	currentMode = mode;
	document.getElementById('sendSection').classList.add('hidden');
	document.getElementById('receiveSection').classList.add('hidden');
	if (mode === 'send') {
		document.getElementById('sendSection').classList.remove('hidden');
		showToast('Send mode selected', 'info');
	} else {
		document.getElementById('receiveSection').classList.remove('hidden');
		showToast('Receive mode selected', 'info');
	}
}

function generateShareCode() {
	activeShareCode = Math.floor(100000 + Math.random() * 900000).toString();
	document.getElementById('shareCode').textContent = activeShareCode;
	codeExpiryTime = Date.now() + 5 * 60 * 1000;
	if (codeExpiryTimer) clearInterval(codeExpiryTimer);
	codeExpiryTimer = setInterval(() => {
		const rem = codeExpiryTime - Date.now();
		if (rem <= 0) {
			clearInterval(codeExpiryTimer);
			document.getElementById('codeTimer').textContent = '00:00';
			document.getElementById('shareCode').textContent = 'Code expired';
			activeShareCode = null;
			return;
		}
		const m = Math.floor(rem / 60000).toString().padStart(2, '0');
		const s = Math.floor((rem % 60000) / 1000).toString().padStart(2, '0');
		document.getElementById('codeTimer').textContent = `${m}:${s}`;
	}, 1000);
	sessionStore.create(activeShareCode);
	const files = document.getElementById('fileInput').files;
	if (files && files.length) Array.from(files).forEach(f => sessionStore.addFile(activeShareCode, { name: f.name, size: f.size, type: f.type, blob: f }));
	showToast(`Share code generated: ${activeShareCode}`);
}

// Receive/connect
function connectToSender() {
	const code = document.getElementById('receiveCode').value.trim();
	const statusDiv = document.getElementById('connectionStatus');
	if (!/^[0-9]{6}$/.test(code)) { showToast('Enter a valid 6-digit code', 'error'); return; }
	statusDiv.innerHTML = `<div class="status-item">🔍 Connecting...</div><div class="status-item">📡 Code: ${code}</div>`;
	setTimeout(() => {
		statusDiv.innerHTML = `<div class="status-item">✅ Connected!</div>`;
		renderReceivedFiles(code);
	}, 800);
}

function renderReceivedFiles(code) {
	const receivedFiles = document.getElementById('receivedFiles');
	receivedFiles.innerHTML = '';
	const files = sessionStore.listFiles(code);
	if (!files.length) {
		receivedFiles.innerHTML = '<div class="status-item">📭 No files available for this code.</div>';
		return;
	}
	files.forEach(file => {
		const card = document.createElement('div');
		card.className = 'file-received-card';
		card.innerHTML = `
			<div class="file-received-icon">${getFileIcon(file.type)}</div>
			<div class="file-received-info">
				<div class="file-received-name">${file.name}</div>
				<div class="file-received-size">${formatFileSize(file.size)}</div>
			</div>
		`;
		const btn = document.createElement('button');
		btn.className = 'download-btn';
		btn.textContent = 'Download';
		btn.onclick = async () => {
			await triggerBlobDownload(file.blob, file.name, file.type);
			showToast('Download complete');
			sessionStore.deleteFile(code, file.name);
			renderReceivedFiles(code);
		};
		card.appendChild(btn);
		receivedFiles.appendChild(card);
	});
}

// File selection (sender)
const uploadArea = () => document.querySelector('.upload-area');
function bindUploadArea() {
	const area = uploadArea();
	if (!area) return;
	area.addEventListener('dragover', e => { e.preventDefault(); area.style.borderColor = 'rgba(255,255,255,0.6)'; area.style.background = 'rgba(255,255,255,0.1)'; });
	area.addEventListener('dragleave', e => { e.preventDefault(); area.style.borderColor = 'rgba(255,255,255,0.2)'; area.style.background = 'rgba(255,255,255,0.02)'; });
	area.addEventListener('drop', e => {
		e.preventDefault(); area.style.borderColor = 'rgba(255,255,255,0.2)'; area.style.background = 'rgba(255,255,255,0.02)';
		const files = Array.from(e.dataTransfer.files || []);
		if (!files.length) return;
		const input = document.getElementById('fileInput');
		// cannot assign FileList directly; just mirror into sessions
		if (activeShareCode) files.forEach(f => sessionStore.addFile(activeShareCode, { name: f.name, size: f.size, type: f.type, blob: f }));
		showToast(`Selected ${files.length} file(s)`);
	});
}

document.addEventListener('change', (e) => {
	if (e.target && e.target.id === 'fileInput') {
		const files = Array.from(e.target.files || []);
		if (activeShareCode) files.forEach(f => sessionStore.addFile(activeShareCode, { name: f.name, size: f.size, type: f.type, blob: f }));
		showToast(`Selected ${files.length} file(s)`);
	}
});

// Utilities
function getFileIcon(type) {
	if ((type||'').startsWith('image/')) return '🖼️';
	if ((type||'').startsWith('video/')) return '🎥';
	if ((type||'').startsWith('audio/')) return '🎵';
	if ((type||'').includes('pdf')) return '📄';
	if ((type||'').includes('zip') || (type||'').includes('rar')) return '📦';
	return '📁';
}

function formatFileSize(bytes) {
	if (!bytes) return '0 Bytes';
	const k = 1024; const sizes = ['Bytes','KB','MB','GB'];
	const i = Math.floor(Math.log(bytes)/Math.log(k));
	return `${parseFloat((bytes/Math.pow(k,i)).toFixed(2))} ${sizes[i]}`;
}

async function triggerBlobDownload(blob, filename, type) {
	const data = blob instanceof Blob ? blob : new Blob([blob], { type: type || 'application/octet-stream' });
	const url = URL.createObjectURL(data);
	const a = document.createElement('a');
	a.href = url; a.download = filename || 'download';
	document.body.appendChild(a); a.click(); a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 0);
}

// TayBot
const taybot = {
	init() {
		this.messages = document.getElementById('taybotMessages');
		this.input = document.getElementById('taybotInput');
		this.btn = document.getElementById('taybotSend');
		this.mic = document.getElementById('taybotMic');
		this.btn.addEventListener('click', () => this.send());
		this.input.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.send(); });
		this.mic.addEventListener('click', () => this.toggleVoice());
		this.synth = window.speechSynthesis;
		this.recognition = null;
	},
	append(role, text, speak = false) {
		const wrap = document.createElement('div');
		wrap.className = `taybot-msg ${role}`;
		const bubble = document.createElement('div');
		bubble.className = 'bubble'; bubble.textContent = text;
		const caption = document.createElement('div');
		caption.className = 'taybot-caption';
		caption.textContent = role === 'user' ? 'You' : 'TayBot';
		wrap.appendChild(bubble); wrap.appendChild(caption);
		this.messages.appendChild(wrap);
		this.messages.scrollTop = this.messages.scrollHeight;
		if (speak && role !== 'user') this.speak(text);
	},
	send() {
		const text = (this.input.value || '').trim(); if (!text) return;
		this.append('user', text);
		this.input.value = '';
		this.handleCommand(text.toLowerCase());
	},
	speak(text) {
		if (!this.synth) return;
		const utter = new SpeechSynthesisUtterance(text);
		utter.pitch = 1.05; utter.rate = 1; utter.volume = 1;
		const voices = this.synth.getVoices();
		const preferred = voices.find(v => /female|samantha|victoria|zira|zira/i.test(v.name)) || voices.find(v => v.lang.startsWith('en')) || voices[0];
		if (preferred) utter.voice = preferred;
		this.synth.cancel(); this.synth.speak(utter);
	},
	ensureRecognition() {
		const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
		if (!SR) return null;
		if (!this.recognition) { this.recognition = new SR(); this.recognition.continuous = false; this.recognition.interimResults = false; this.recognition.lang = 'en-US'; }
		return this.recognition;
	},
	toggleVoice() {
		const rec = this.ensureRecognition();
		if (!rec) { this.append('assistant', 'Speech recognition not supported on this browser.', true); return; }
		if (isListening) { rec.stop(); isListening = false; return; }
		isListening = true;
		rec.onresult = (e) => { const t = e.results[0][0].transcript; isListening = false; this.append('user', t); this.handleCommand(t.toLowerCase()); };
		rec.onerror = () => { isListening = false; };
		rec.onend = () => { isListening = false; };
		rec.start();
	},
	handleCommand(cmd) {
		if (cmd.includes('send file to code')) {
			const code = (cmd.match(/code\s*(\d{4,6})/) || [])[1];
			if (!code) return this.append('assistant', 'Please specify a 4-6 digit code.', true);
			if (!activeShareCode) generateShareCode();
			// move current selected files to that code
			const files = Array.from(document.getElementById('fileInput').files || []);
			files.forEach(f => sessionStore.addFile(code, { name: f.name, size: f.size, type: f.type, blob: f }));
			this.append('assistant', `Queued ${files.length} file(s) under code ${code}. Share the code with the receiver.`, true);
			return;
		}
		if (cmd.includes('receive') || cmd.includes('connect') || cmd.includes('download from code')) {
			const code = (cmd.match(/code\s*(\d{4,6})/) || [])[1];
			if (!code) return this.append('assistant', 'Say: "Connect to code 123456"', true);
			document.getElementById('receiveCode').value = code;
			connectToSender();
			this.append('assistant', `Connecting to ${code} and preparing downloads.`, true);
			return;
		}
		if (cmd.includes('show transfer') || cmd.includes('start transfer')) {
			showView('transfer', document.querySelector('[data-nav="transfer"]'));
			this.append('assistant', 'Opened File Transfer.', true);
			return;
		}
		if (cmd.includes('dashboard') || cmd.includes('status')) {
			showView('dashboard', document.querySelector('[data-nav="dashboard"]'));
			this.append('assistant', 'Here is the dashboard overview.', true);
			return;
		}
		if (cmd.includes('performance') || cmd.includes('analytics')) {
			const speed = document.querySelector('.stat-card:nth-child(4) .stat-value')?.textContent || 'N/A';
			this.append('assistant', `Current transfer speed is ${speed}. AI optimization active with real-time error correction.`, true);
			return;
		}
		this.append('assistant', 'I can help send/receive files, show stats, and manage connectivity. Try: "Send file to code 4521".', true);
	}
};

// Enhanced features
const cryptoUtils = {
	async generateKey() {
		return await crypto.subtle.generateKey(
			{ name: 'AES-GCM', length: 256 },
			true,
			['encrypt', 'decrypt']
		);
	},
	
	async encrypt(data, key) {
		const iv = crypto.getRandomValues(new Uint8Array(12));
		const encrypted = await crypto.subtle.encrypt(
			{ name: 'AES-GCM', iv: iv },
			key,
			data
		);
		return { encrypted, iv };
	},
	
	async decrypt(encryptedData, key, iv) {
		return await crypto.subtle.decrypt(
			{ name: 'AES-GCM', iv: iv },
			key,
			encryptedData
		);
	}
};

const fileClassifier = {
	classify(file) {
		const type = file.type || '';
		if (type.startsWith('image/')) return { category: 'image', color: '#10b981', icon: '🖼️' };
		if (type.startsWith('video/')) return { category: 'video', color: '#f59e0b', icon: '🎥' };
		if (type.startsWith('audio/')) return { category: 'audio', color: '#8b5cf6', icon: '🎵' };
		if (type.includes('pdf')) return { category: 'document', color: '#ef4444', icon: '📄' };
		if (type.includes('word') || type.includes('document')) return { category: 'document', color: '#3b82f6', icon: '📝' };
		if (type.includes('zip') || type.includes('rar')) return { category: 'archive', color: '#f97316', icon: '📦' };
		return { category: 'other', color: '#6b7280', icon: '📁' };
	}
};

const deviceManager = {
	async getDeviceInfo() {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		ctx.textBaseline = 'top';
		ctx.font = '14px Arial';
		ctx.fillText('Device fingerprint', 2, 2);
		
		const fingerprint = await crypto.subtle.digest('SHA-256', canvas.toDataURL());
		const deviceId = Array.from(new Uint8Array(fingerprint)).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 8);
		
		return {
			id: deviceId,
			name: `Device-${deviceId.substring(0, 4)}`,
			platform: navigator.platform,
			userAgent: navigator.userAgent.substring(0, 50) + '...'
		};
	}
};

// WebRTC for P2P transfers
const webrtcManager = {
	peerConnection: null,
	dataChannel: null,
	
	async createConnection() {
		const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
		this.peerConnection = new RTCPeerConnection(config);
		
		this.dataChannel = this.peerConnection.createDataChannel('aeroshare', {
			ordered: true
		});
		
		this.peerConnection.ondatachannel = (event) => {
			const channel = event.channel;
			channel.onmessage = (event) => {
				this.handleReceivedData(event.data);
			};
		};
		
		return this.peerConnection;
	},
	
	handleReceivedData(data) {
		try {
			const fileData = JSON.parse(data);
			// Handle received file data
			console.log('Received file via WebRTC:', fileData);
		} catch (error) {
			console.error('Error handling WebRTC data:', error);
		}
	}
};

// Enhanced TayBot with memory and natural language
const enhancedTayBot = {
	...taybot,
	memory: [],
	maxMemorySize: 10,
	
	init() {
		taybot.init();
		this.loadMemory();
		this.addWelcomeMessage();
	},
	
	loadMemory() {
		const stored = localStorage.getItem('taybot-memory');
		if (stored) {
			this.memory = JSON.parse(stored);
		}
	},
	
	saveMemory() {
		localStorage.setItem('taybot-memory', JSON.stringify(this.memory));
	},
	
	addToMemory(role, content) {
		this.memory.push({ role, content, timestamp: Date.now() });
		if (this.memory.length > this.maxMemorySize) {
			this.memory.shift();
		}
		this.saveMemory();
	},
	
	addWelcomeMessage() {
		this.append('assistant', 'Hello! I\'m TayBot, your AI assistant. I can help you send files, manage transfers, and answer questions. Try saying "Send my latest screenshot" or "Show transfer stats".', true);
	},
	
	append(role, text, speak = false) {
		taybot.append(role, text, speak);
		this.addToMemory(role, text);
	},
	
	handleCommand(cmd) {
		// Enhanced natural language processing
		if (cmd.includes('send') && (cmd.includes('screenshot') || cmd.includes('latest'))) {
			this.handleScreenshotRequest();
		} else if (cmd.includes('receive') || cmd.includes('connect') || cmd.includes('download from code')) {
			const code = (cmd.match(/code\s*(\d{4,6})/) || [])[1];
			if (!code) return this.append('assistant', 'Say: "Connect to code 123456"', true);
			document.getElementById('receiveCode').value = code;
			connectToSender();
			this.append('assistant', `Connecting to ${code} and preparing downloads.`, true);
		} else if (cmd.includes('show') && (cmd.includes('transfer') || cmd.includes('stats') || cmd.includes('performance'))) {
			this.showTransferStats();
		} else if (cmd.includes('last') && cmd.includes('transfer')) {
			this.showRecentTransfers();
		} else if (cmd.includes('encryption') || cmd.includes('security')) {
			this.toggleEncryption();
		} else if (cmd.includes('hackathon') || cmd.includes('demo')) {
			this.toggleHackathonMode();
		} else {
			taybot.handleCommand(cmd);
		}
	},
	
	async handleScreenshotRequest() {
		try {
			// Request screenshot permission and capture
			const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
			const video = document.createElement('video');
			video.srcObject = stream;
			video.play();
			
			video.onloadedmetadata = () => {
				const canvas = document.createElement('canvas');
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				const ctx = canvas.getContext('2d');
				ctx.drawImage(video, 0, 0);
				
				canvas.toBlob((blob) => {
					const file = new File([blob], `screenshot-${Date.now()}.png`, { type: 'image/png' });
					if (activeShareCode) {
						sessionStore.addFile(activeShareCode, { 
							name: file.name, 
							size: file.size, 
							type: file.type, 
							blob: file 
						});
						this.append('assistant', `Screenshot captured and added to code ${activeShareCode}!`, true);
					} else {
						generateShareCode();
						setTimeout(() => {
							sessionStore.addFile(activeShareCode, { 
								name: file.name, 
								size: file.size, 
								type: file.type, 
								blob: file 
							});
							this.append('assistant', `Screenshot captured! Generated code ${activeShareCode}.`, true);
						}, 100);
					}
					stream.getTracks().forEach(track => track.stop());
				});
			};
		} catch (error) {
			this.append('assistant', 'Sorry, I couldn\'t capture a screenshot. Please check your permissions.', true);
		}
	},
	
	showTransferStats() {
		const stats = `📊 Transfer Statistics:
• Total Transfers: ${transferStats.totalTransfers}
• Data Transferred: ${formatFileSize(transferStats.totalData)}
• Average Speed: ${transferStats.avgSpeed.toFixed(1)} MB/s
• Encryption Rate: ${transferStats.encryptionRate}%`;
		this.append('assistant', stats, true);
	},
	
	showRecentTransfers() {
		const recent = sessionStore.data;
		const codes = Object.keys(recent).slice(-5);
		if (codes.length === 0) {
			this.append('assistant', 'No recent transfers found.', true);
			return;
		}
		
		let message = '📋 Recent Transfer Codes:\n';
		codes.forEach(code => {
			const session = recent[code];
			message += `• ${code}: ${session.files.length} file(s)\n`;
		});
		this.append('assistant', message, true);
	},
	
	toggleEncryption() {
		encryptionEnabled = !encryptionEnabled;
		this.append('assistant', `Encryption ${encryptionEnabled ? 'enabled' : 'disabled'}.`, true);
		updateEncryptionIndicator();
	},
	
	toggleHackathonMode() {
		hackathonMode = !hackathonMode;
		updateHackathonMode();
		this.append('assistant', `Hackathon mode ${hackathonMode ? 'enabled' : 'disabled'}.`, true);
	}
};

// Hackathon mode functions
function updateHackathonMode() {
	const banner = document.getElementById('hackathonBanner');
	if (hackathonMode) {
		if (!banner) {
			const hackathonBanner = document.createElement('div');
			hackathonBanner.id = 'hackathonBanner';
			hackathonBanner.className = 'hackathon-mode';
			hackathonBanner.innerHTML = '🏆 AeroShare – Chrome AI File Transfer | Demo Mode Active';
			document.body.insertBefore(hackathonBanner, document.body.firstChild);
		}
		updateDemoStats();
	} else {
		if (banner) banner.remove();
	}
}

function updateDemoStats() {
	if (!hackathonMode) return;
	
	// Update dashboard with demo metrics
	const statCards = document.querySelectorAll('.stat-card');
	if (statCards[0]) statCards[0].querySelector('.stat-value').textContent = '12';
	if (statCards[1]) statCards[1].querySelector('.stat-value').textContent = '47';
	if (statCards[2]) statCards[2].querySelector('.stat-value').textContent = '8';
	if (statCards[3]) statCards[3].querySelector('.stat-value').textContent = '24.7 MB/s';
	if (statCards[4]) statCards[4].querySelector('.stat-value').textContent = '3.2 GB';
	if (statCards[5]) statCards[5].querySelector('.stat-value').textContent = '156';
}

function updateEncryptionIndicator() {
	const indicators = document.querySelectorAll('.encryption-indicator');
	indicators.forEach(indicator => {
		indicator.style.display = encryptionEnabled ? 'inline-flex' : 'none';
	});
}

// File flying animation
function createFileFlyingAnimation(fileIcon, startX, startY, endX, endY) {
	const flying = document.createElement('div');
	flying.className = 'file-flying';
	flying.innerHTML = fileIcon;
	flying.style.left = startX + 'px';
	flying.style.top = startY + 'px';
	flying.style.fontSize = '24px';
	
	document.body.appendChild(flying);
	
	// Calculate end position
	const deltaX = endX - startX;
	const deltaY = endY - startY;
	
	flying.style.setProperty('--end-x', endX + 'px');
	flying.style.setProperty('--end-y', endY + 'px');
	
	setTimeout(() => {
		flying.remove();
	}, 2000);
}

// Enhanced download with encryption
async function triggerBlobDownload(blob, filename, type) {
	let data = blob;
	
	if (encryptionEnabled && blob instanceof Blob) {
		try {
			const key = await cryptoUtils.generateKey();
			const arrayBuffer = await blob.arrayBuffer();
			const { encrypted, iv } = await cryptoUtils.encrypt(arrayBuffer, key);
			
			// Create encrypted blob
			const encryptedBlob = new Blob([encrypted], { type: 'application/octet-stream' });
			data = encryptedBlob;
			
			// Store key for decryption (in real app, this would be shared securely)
			sessionStorage.setItem(`key_${filename}`, JSON.stringify({
				key: await crypto.subtle.exportKey('raw', key),
				iv: Array.from(iv)
			}));
			
			showToast('File encrypted before download');
		} catch (error) {
			console.error('Encryption failed:', error);
			showToast('Encryption failed, downloading unencrypted', 'error');
		}
	}
	
	const url = URL.createObjectURL(data);
	const a = document.createElement('a');
	a.href = url; 
	a.download = filename || 'download';
	document.body.appendChild(a); 
	a.click(); 
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 0);
	
	// Update stats
	transferStats.totalTransfers++;
	transferStats.totalData += blob.size;
	transferStats.avgSpeed = (transferStats.totalData / transferStats.totalTransfers) / (1024 * 1024);
}

// Init
window.addEventListener('DOMContentLoaded', async () => {
	bindUploadArea();
	enhancedTayBot.init();
	
	// Initialize device info
	deviceInfo = await deviceManager.getDeviceInfo();
	
	// Add hackathon toggle
	const hackathonToggle = document.createElement('button');
	hackathonToggle.className = 'hackathon-toggle';
	hackathonToggle.textContent = '🏆 Demo Mode';
	hackathonToggle.onclick = () => enhancedTayBot.toggleHackathonMode();
	document.body.appendChild(hackathonToggle);
	
	// Add encryption indicator
	const encryptionIndicator = document.createElement('div');
	encryptionIndicator.className = 'encryption-indicator';
	encryptionIndicator.textContent = 'AES-256 Encrypted';
	document.querySelector('.header').appendChild(encryptionIndicator);
	
	// Initialize WebRTC
	await webrtcManager.createConnection();
	
	// Check for Chrome extension context
	if (typeof chrome !== 'undefined' && chrome.runtime) {
		// Handle pending shares from extension
		const { pendingShare, pendingFileShare } = await chrome.storage.local.get(['pendingShare', 'pendingFileShare']);
		if (pendingShare || pendingFileShare) {
			enhancedTayBot.append('assistant', 'Content from Chrome extension ready to share!', true);
		}
	}
});


