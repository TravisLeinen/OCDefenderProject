// Main application initialization and global variable setup

// Global variables for compatibility
let sessionId = generateSessionId();
let currentCaseNumber = '';

// Initialize all managers
const chatManager = new ChatManager();
const indexerManager = new IndexerManager();
const caseManager = new CaseManager(chatManager, indexerManager);
const chatUI = new ChatUI(chatManager);
const fileUploadManager = new FileUploadManager();
const fileManager = new FileManager();

// Make managers globally available
window.chatManager = chatManager;
window.indexerManager = indexerManager;
window.caseManager = caseManager;
window.chatUI = chatUI;
window.fileUploadManager = fileUploadManager;
window.fileManager = fileManager;
window.sessionId = sessionId;
window.currentCaseNumber = currentCaseNumber;

console.log('Application initialized with Session ID:', sessionId);