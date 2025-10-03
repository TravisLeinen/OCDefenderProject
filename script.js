// Generate a unique session ID
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Chat management system for multiple chats within a case
class ChatManager {
  constructor() {
    this.chats = new Map();
    this.activeChatId = null;
    this.currentCaseNumber = '';
  }

  createChat(chatName = null) {
    const chatId = generateSessionId();
    const chat = {
      id: chatId,
      name: chatName || `Chat ${this.chats.size + 1}`,
      messages: [],
      createdAt: new Date()
    };
    this.chats.set(chatId, chat);
    console.log('Created new chat:', chatId, 'Name:', chat.name);
    return chatId;
  }

  setActiveChat(chatId) {
    if (this.chats.has(chatId)) {
      this.activeChatId = chatId;
      console.log('Switched to chat:', chatId);
      return true;
    }
    return false;
  }

  getActiveChat() {
    return this.chats.get(this.activeChatId);
  }

  getAllChats() {
    return Array.from(this.chats.values());
  }

  removeChat(chatId) {
    this.chats.delete(chatId);
    if (this.activeChatId === chatId) {
      // Switch to another chat if available
      const remainingChats = this.getAllChats();
      this.activeChatId = remainingChats.length > 0 ? remainingChats[0].id : null;
    }
  }

  clearAllChats() {
    this.chats.clear();
    this.activeChatId = null;
    console.log('Cleared all chats for case switch');
  }

  addMessageToChat(chatId, sender, message) {
    const chat = this.chats.get(chatId);
    if (chat) {
      chat.messages.push({
        sender: sender,
        message: message,
        timestamp: new Date()
      });
    }
  }

  setCaseNumber(caseNumber) {
    this.currentCaseNumber = caseNumber;
  }
}

// Initialize chat manager
const chatManager = new ChatManager();

// Legacy variables for backward compatibility
let sessionId = generateSessionId();
console.log('Session ID:', sessionId);

let currentCaseNumber = '';

// DOM elements
const caseEntryScreen = document.getElementById('caseEntryScreen');
const mainApp = document.getElementById('mainApp');
const caseEntryForm = document.getElementById('caseEntryForm');
const caseNumberInput = document.getElementById('caseNumberInput');
const caseSubmitBtn = document.getElementById('caseSubmitBtn');
const caseInfo = document.getElementById('caseInfo');
const currentCaseNumberSpan = document.getElementById('currentCaseNumber');

const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('chatInput');
const chatBox = document.getElementById('chatBox');
const uploadForm = document.getElementById('uploadForm');

// Case number entry handler
caseEntryForm.addEventListener('submit', function(e) {
  e.preventDefault();
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
  
  // Store the case number
  currentCaseNumber = caseNumber;
  chatManager.setCaseNumber(caseNumber);
  
  // Create the first chat for this case
  const firstChatId = chatManager.createChat('Main Chat');
  chatManager.setActiveChat(firstChatId);
  sessionId = firstChatId;
  
  // Update the case info display
  currentCaseNumberSpan.textContent = caseNumber;
  caseInfo.classList.add('show');
  
  // Update chat tabs
  updateChatTabs();
  
  // Hide case entry screen and show main app
  caseEntryScreen.style.display = 'none';
  mainApp.classList.add('active');
  
  // Clear chat box and focus on chat input
  clearChatBox();
  userInput.focus();
  
  console.log('Case number set:', caseNumber, 'First chat created:', firstChatId);
});

// Function to switch case numbers
function switchCaseNumber() {
  // Clear all chats when switching cases
  chatManager.clearAllChats();
  
  // Generate new session ID for the new case
  sessionId = generateSessionId();
  console.log('New Session ID:', sessionId);
  
  // Reset the form
  caseNumberInput.value = '';
  
  // Clear chat box
  clearChatBox();
  
  // Hide main app and show case entry screen
  mainApp.classList.remove('active');
  caseEntryScreen.style.display = 'flex';
  
  // Focus on case number input
  caseNumberInput.focus();
  
  console.log('Switching case number - all chats cleared');
}


// Chat form submission handler
chatForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const message = userInput.value.trim();
  if (message === '') return;

  // Ensure we have an active chat
  if (!chatManager.activeChatId) {
    alert('Please create a chat first.');
    return;
  }

  // Update session ID to active chat ID
  sessionId = chatManager.activeChatId;

  appendMessage('user', message);
  userInput.value = '';

  // Disable forms during chat processing
  const sendBtn = document.getElementById('sendBtn');
  const uploadBtn = document.getElementById('uploadBtn');
  const fileInput = document.getElementById('fileInput');
  
  sendBtn.disabled = true;
  userInput.disabled = true;
  uploadBtn.disabled = true;
  fileInput.disabled = true;

  // Show "thinking" indicator
  const thinkingMessageId = 'thinking_' + Date.now();
  appendMessage('bot', `<div id="${thinkingMessageId}" style="display: flex; align-items: center; gap: 8px; font-style: italic; opacity: 0.8;"><div style="display: flex; gap: 2px;"><div style="width: 6px; height: 6px; background: #d4af37; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; animation-delay: -0.32s;"></div><div style="width: 6px; height: 6px; background: #d4af37; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; animation-delay: -0.16s;"></div><div style="width: 6px; height: 6px; background: #d4af37; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both;"></div></div>Assistant is thinking...</div><style>@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }</style>`);

  // Await AI response
  try {
    console.log('Sending chat...');
    const response = await fetch('https://ocdefonblobupload-ffcwb6frd2gnd0f8.westus2-01.azurewebsites.net/api/SubmitChat?code=zFqYyoEA4aObdFx_IyNtzSMFTLVbrcTypZCRThzIC_anAzFu1xu3iw==', {
    // const response = await fetch('http://localhost:7129/api/SubmitChat', {
      method: 'POST',
      body: JSON.stringify({ Message: message, SessionId: sessionId, CaseNumber: currentCaseNumber }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.text();
    
    // Remove thinking indicator
    const thinkingMsg = document.getElementById(thinkingMessageId);
    if (thinkingMsg) {
      thinkingMsg.closest('.message').remove();
    }
    
    appendMessage('bot', result);
    
    // Re-enable forms after successful chat
    sendBtn.disabled = false;
    userInput.disabled = false;
    uploadBtn.disabled = false;
    fileInput.disabled = false;
  } catch (err) {
    console.error('Upload error', err);
    
    // Remove thinking indicator on error
    const thinkingMsg = document.getElementById(thinkingMessageId);
    if (thinkingMsg) {
      thinkingMsg.closest('.message').remove();
    }
    
    appendMessage('bot', 'Sorry, there was an error processing your request: ' + (err && err.message ? err.message : 'unknown error'));
    
    // Re-enable forms after chat error
    sendBtn.disabled = false;
    userInput.disabled = false;
    uploadBtn.disabled = false;
    fileInput.disabled = false;
  }
});

// File upload form submission handler
uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('fileInput');
  const uploadBtn = document.getElementById('uploadBtn');
  const files = input ? input.files : null;

  if (!files || files.length === 0) {
    alert('No files selected');
    return;
  }

  // Ensure we have an active chat
  if (!chatManager.activeChatId) {
    alert('Please create a chat first.');
    return;
  }

  const formData = new FormData();
  // Append case number
  formData.append('caseNumber', currentCaseNumber);
  // Append all selected files. Use 'files[]' so server frameworks treat them as an array.
  for (let i = 0; i < files.length; i++) {
    formData.append('files[]', files[i], files[i].name);
  }

  // Disable forms during upload
  const sendBtn = document.getElementById('sendBtn');
  const chatInput = document.getElementById('chatInput');
  
  sendBtn.disabled = true;
  chatInput.disabled = true;
  
  // Show loading state
  const originalBtnText = uploadBtn.textContent;
  uploadBtn.textContent = 'Uploading...';
  uploadBtn.disabled = true;
  input.disabled = true;
  
  // Create file list for display
  const fileNames = Array.from(files).map(file => file.name);
  const fileListHtml = fileNames.map(name => `<li style="margin: 2px 0; color: #d1d5db;">${name}</li>`).join('');
  
  // Add loading message to chat
  const loadingMessageId = 'loading_' + Date.now();
  appendMessage("System", `<div id="${loadingMessageId}" style="display: flex; flex-direction: column; gap: 8px;"><div style="display: flex; align-items: center; gap: 8px;"><div style="width: 16px; height: 16px; border: 2px solid #374151; border-top: 2px solid #d4af37; border-radius: 50%; animation: spin 1s linear infinite;"></div>Uploading ${files.length} file${files.length > 1 ? 's' : ''}...</div><ul style="margin: 4px 0 0 24px; padding: 0; list-style-type: disc;">${fileListHtml}</ul></div><style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>`);

  try {
    console.log('Uploading files...');
    const response = await fetch('https://ocdefonblobupload-ffcwb6frd2gnd0f8.westus2-01.azurewebsites.net/api/UploadPDF?code=dc4riUFRUGw4j0b0W2V1J-JivxH-iPresSi49yoMryNlAzFuumATfg==', {
      method: 'POST',
      body: formData
    });

    const result = await response.text();

    // TODO: Handle result failures
    
    // Remove loading message
    const loadingMsg = document.getElementById(loadingMessageId);
    if (loadingMsg) {
      loadingMsg.closest('.message').remove();
    }
    
    // Show successful upload message with file list
    const successFileListHtml = fileNames.map(name => `<li style="margin: 2px 0; color: #10b981;">${name}</li>`).join('');
    appendMessage("System", `<div style="color: #10b981; font-weight: 500;">✅ Successfully uploaded ${files.length} file${files.length > 1 ? 's' : ''}:</div><ul style="margin: 4px 0 0 16px; padding: 0; list-style-type: disc;">${successFileListHtml}</ul>`);
    
    // Clear the file input after successful upload
    input.value = '';
  } catch (err) {
    console.error('Upload error', err);
    
    // Remove loading message on error
    const loadingMsg = document.getElementById(loadingMessageId);
    if (loadingMsg) {
      loadingMsg.closest('.message').remove();
    }
    
    appendMessage("System", "Upload failed: " + (err && err.message ? err.message : 'unknown error'));
  } finally {
    // Reset button state and re-enable all forms
    uploadBtn.textContent = originalBtnText;
    uploadBtn.disabled = false;
    input.disabled = false;
    sendBtn.disabled = false;
    chatInput.disabled = false;
  }
});

// Chat response appending
function appendMessage(sender, text) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender);

  // Bubble only, no avatar
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = text;
  msgDiv.appendChild(bubble);

  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
  
  // Store message in active chat
  if (chatManager.activeChatId) {
    chatManager.addMessageToChat(chatManager.activeChatId, sender, text);
  }
}

// Chat management UI functions
function updateChatTabs() {
  const tabsList = document.getElementById('chatTabsList');
  if (!tabsList) return;
  
  tabsList.innerHTML = '';
  
  const chats = chatManager.getAllChats();
  chats.forEach(chat => {
    const tab = document.createElement('div');
    tab.className = `chat-tab ${chat.id === chatManager.activeChatId ? 'active' : ''}`;
    tab.innerHTML = `
      <span title="Chat: ${chat.name}">${chat.name}</span>
      <button class="chat-tab-close" onclick="closeChat('${chat.id}')" title="Close chat">
        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;
    
    tab.onclick = (e) => {
      if (!e.target.closest('.chat-tab-close')) {
        switchToChat(chat.id);
      }
    };
    
    tabsList.appendChild(tab);
  });
}

function createNewChat() {
  const chatName = `Chat ${chatManager.getAllChats().length + 1}`;
  const newChatId = chatManager.createChat(chatName);
  chatManager.setActiveChat(newChatId);
  sessionId = newChatId;
  
  // Update UI
  updateChatTabs();
  clearChatBox();
  
  // Focus on chat input
  userInput.focus();
  
  console.log('Created new chat:', newChatId, 'Name:', chatName);
}

function switchToChat(chatId) {
  const chat = chatManager.chats.get(chatId);
  if (!chat) return;
  
  chatManager.setActiveChat(chatId);
  sessionId = chatId;
  
  // Update UI
  updateChatTabs();
  
  // Clear and load chat history
  clearChatBox();
  loadChatHistory(chatId);
  
  console.log('Switched to chat:', chatId, 'Name:', chat.name);
}

function closeChat(chatId) {
  if (chatManager.chats.size <= 1) {
    alert('Cannot close the last chat. Please create a new chat first.');
    return;
  }
  
  chatManager.removeChat(chatId);
  
  // If we closed the active chat, switch to another one
  if (chatManager.activeChatId) {
    const activeChat = chatManager.getActiveChat();
    if (activeChat) {
      switchToChat(activeChat.id);
    }
  } else {
    // No chats left, create a new one
    createNewChat();
  }
  
  updateChatTabs();
}

function clearChatBox() {
  chatBox.innerHTML = '';
}

function loadChatHistory(chatId) {
  const chat = chatManager.chats.get(chatId);
  if (!chat) return;
  
  chat.messages.forEach(msg => {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', msg.sender);

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = msg.message;
    msgDiv.appendChild(bubble);

    chatBox.appendChild(msgDiv);
  });
  
  chatBox.scrollTop = chatBox.scrollHeight;
}