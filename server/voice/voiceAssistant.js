class VoiceAssistant {
  constructor() {
    this.commands = new Map();
    this.initializeCommands();
  }

  // Initialize voice commands
  initializeCommands() {
    this.commands.set('dashboard', this.handleDashboardCommand.bind(this));
    this.commands.set('transfer', this.handleTransferCommand.bind(this));
    this.commands.set('ai', this.handleAICommand.bind(this));
    this.commands.set('p2p', this.handleP2PCommand.bind(this));
    this.commands.set('status', this.handleStatusCommand.bind(this));
    this.commands.set('pause', this.handlePauseCommand.bind(this));
    this.commands.set('resume', this.handleResumeCommand.bind(this));
    this.commands.set('help', this.handleHelpCommand.bind(this));
  }

  // Process voice command
  processCommand(commandData, socket) {
    const { command } = commandData;
    const normalizedCommand = command.toLowerCase().trim();
    
    console.log('Processing voice command:', normalizedCommand);
    
    // Find matching command
    let matchedCommand = null;
    let response = '';
    
    for (const [key, handler] of this.commands) {
      if (normalizedCommand.includes(key)) {
        matchedCommand = key;
        response = handler(socket);
        break;
      }
    }
    
    if (!matchedCommand) {
      response = this.handleUnknownCommand(normalizedCommand);
    }
    
    // Send response back to client
    socket.emit('voice-response', {
      command: normalizedCommand,
      response: response,
      timestamp: Date.now()
    });
    
    return response;
  }

  // Command handlers
  handleDashboardCommand(socket) {
    socket.emit('navigate-to', { view: 'dashboard' });
    return 'Navigating to dashboard';
  }

  handleTransferCommand(socket) {
    socket.emit('navigate-to', { view: 'transfer' });
    return 'Opening file transfer interface';
  }

  handleAICommand(socket) {
    socket.emit('navigate-to', { view: 'ai' });
    return 'Showing AI analytics and predictions';
  }

  handleP2PCommand(socket) {
    socket.emit('navigate-to', { view: 'p2p' });
    return 'Opening P2P network manager';
  }

  handleStatusCommand(socket) {
    socket.emit('request-status');
    return 'Checking transfer status';
  }

  handlePauseCommand(socket) {
    socket.emit('pause-transfers');
    return 'Pausing all active transfers';
  }

  handleResumeCommand(socket) {
    socket.emit('resume-transfers');
    return 'Resuming paused transfers';
  }

  handleHelpCommand(socket) {
    const helpText = `
      Available voice commands:
      - "Show dashboard" - Navigate to main dashboard
      - "Start transfer" - Begin file transfer
      - "Show AI analytics" - View AI predictions
      - "Connect P2P" - Join peer-to-peer network
      - "Check status" - View transfer status
      - "Pause transfer" - Pause current transfers
      - "Resume transfer" - Resume paused transfers
      - "Help" - Show this help message
    `;
    
    socket.emit('voice-response', {
      command: 'help',
      response: helpText,
      timestamp: Date.now()
    });
    
    return 'Here are the available voice commands';
  }

  handleUnknownCommand(command) {
    return `I didn't understand "${command}". Try saying "help" for available commands.`;
  }

  // Get available commands
  getAvailableCommands() {
    return Array.from(this.commands.keys());
  }

  // Add custom command
  addCommand(keyword, handler) {
    this.commands.set(keyword.toLowerCase(), handler);
  }

  // Remove command
  removeCommand(keyword) {
    this.commands.delete(keyword.toLowerCase());
  }
}

module.exports = VoiceAssistant;
