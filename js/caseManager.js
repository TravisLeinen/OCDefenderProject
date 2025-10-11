// Case number management and switching functionality

class CaseManager {
  constructor(chatManager, indexerManager) {
    this.chatManager = chatManager;
    this.indexerManager = indexerManager;
    this.currentCaseNumber = '';
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    const caseEntryForm = document.getElementById('caseEntryForm');
    if (caseEntryForm) {
      caseEntryForm.addEventListener('submit', (e) => this.handleCaseEntry(e));
    }
  }

  handleCaseEntry(e) {
    e.preventDefault();
    const caseNumberInput = document.getElementById('caseNumberInput');
    const caseNumber = caseNumberInput.value.trim();
    
    if (caseNumber === '') {
      alert('Please enter a case number');
      return;
    }
    
    // Validate case number format (basic validation)
    if (!/^[A-Za-z0-9\-]+$/.test(caseNumber)) {
      alert('Case number should contain only letters, numbers, and hyphens');
      return;
    }
    
    this.setCurrentCase(caseNumber);
  }

  setCurrentCase(caseNumber) {
    // Store the case number
    this.currentCaseNumber = caseNumber;
    this.chatManager.setCaseNumber(caseNumber);
    window.currentCaseNumber = caseNumber; // Global variable for compatibility
    
    // Create the first chat for this case
    const firstChatId = this.chatManager.createChat('Main Chat');
    this.chatManager.setActiveChat(firstChatId);
    window.sessionId = firstChatId; // Global variable for compatibility
    
    // Update UI
    this.updateCaseDisplay(caseNumber);
    this.showMainApp();
    
    // Initialize case-specific functionality
    if (window.chatUI) {
      window.chatUI.updateChatTabs();
      window.chatUI.clearChatBox();
      window.chatUI.focusInput();
    }
    
    // Load case data
    if (window.fileManager) {
      window.fileManager.loadFileList();
    }
    
    // Start indexer status monitoring
    if (this.indexerManager) {
      this.indexerManager.showLoadingState();
      this.indexerManager.startPolling();
    }
    
    console.log('Case number set:', caseNumber, 'First chat created:', firstChatId);
  }

  updateCaseDisplay(caseNumber) {
    const currentCaseNumberSpan = document.getElementById('currentCaseNumber');
    const caseInfo = document.getElementById('caseInfo');
    
    if (currentCaseNumberSpan) {
      currentCaseNumberSpan.textContent = caseNumber;
    }
    if (caseInfo) {
      caseInfo.classList.add('show');
    }
  }

  showMainApp() {
    const caseEntryScreen = document.getElementById('caseEntryScreen');
    const mainApp = document.getElementById('mainApp');
    
    if (caseEntryScreen) {
      caseEntryScreen.style.display = 'none';
    }
    if (mainApp) {
      mainApp.classList.add('active');
    }
  }

  switchCase() {
    // Clear all chats when switching cases
    this.chatManager.clearAllChats();
    
    // Generate new session ID for the new case
    window.sessionId = generateSessionId();
    console.log('New Session ID:', window.sessionId);
    
    // Hide indexer status during case switch
    const indexerStatus = document.getElementById('indexerStatus');
    if (indexerStatus) {
      indexerStatus.style.display = 'none';
    }
    
    // Reset UI
    this.resetCaseEntryForm();
    this.showCaseEntryScreen();
    
    console.log('Switching case number - all chats cleared');
  }

  resetCaseEntryForm() {
    const caseNumberInput = document.getElementById('caseNumberInput');
    if (caseNumberInput) {
      caseNumberInput.value = '';
    }
  }

  showCaseEntryScreen() {
    const caseEntryScreen = document.getElementById('caseEntryScreen');
    const mainApp = document.getElementById('mainApp');
    const caseNumberInput = document.getElementById('caseNumberInput');
    
    if (window.chatUI) {
      window.chatUI.clearChatBox();
    }
    
    if (mainApp) {
      mainApp.classList.remove('active');
    }
    if (caseEntryScreen) {
      caseEntryScreen.style.display = 'flex';
    }
    if (caseNumberInput) {
      caseNumberInput.focus();
    }
  }
}

// Global function for switch case button
function switchCaseNumber() {
  if (window.caseManager) {
    window.caseManager.switchCase();
  }
}