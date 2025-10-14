// Main application initialization and global variable setup

// Global variables for compatibility
let sessionId = generateSessionId();
let currentCaseNumber = '';

// Initialize authentication manager first
const authManager = new AuthManager();

// Initialize all managers
const chatManager = new ChatManager();
const indexerManager = new IndexerManager();
const caseManager = new CaseManager(chatManager, indexerManager);
const chatUI = new ChatUI(chatManager);
const fileUploadManager = new FileUploadManager();
const fileManager = new FileManager();

// Make managers globally available
window.authManager = authManager;
window.chatManager = chatManager;
window.indexerManager = indexerManager;
window.caseManager = caseManager;
window.chatUI = chatUI;
window.fileUploadManager = fileUploadManager;
window.fileManager = fileManager;
window.sessionId = sessionId;
window.currentCaseNumber = currentCaseNumber;

// Application initialization with authentication check
async function initializeApplication() {
  console.log('Initializing application...');
  
  // Check authentication status first
  const isAuthenticated = await authManager.checkAuthStatus();
  
  if (!isAuthenticated) {
    console.log('User not authenticated, showing login screen');
    authManager.showLoginScreen();
    return;
  }
  
  console.log('User authenticated, proceeding with app initialization');
  authManager.hideLoginScreen();
  authManager.updateUserInfo();
  
  // Show case entry screen if no current case
  const savedCaseNumber = localStorage.getItem('currentCaseNumber');
  if (savedCaseNumber) {
    currentCaseNumber = savedCaseNumber;
    window.currentCaseNumber = currentCaseNumber;
    
    // Auto-enter the saved case
    caseManager.enterCase(currentCaseNumber);
  } else {
    // Show case entry screen
    const caseEntryScreen = document.getElementById('caseEntryScreen');
    if (caseEntryScreen) {
      caseEntryScreen.style.display = 'flex';
    }
  }
  
  console.log('Application initialized with Session ID:', sessionId);
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', initializeApplication);