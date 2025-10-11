// Chat user interface management and message handling

class ChatUI {
  constructor(chatManager) {
    this.chatManager = chatManager;
    this.chatBox = document.getElementById('chatBox');
    this.userInput = document.getElementById('chatInput');
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    const chatForm = document.getElementById('chatForm');
    if (chatForm) {
      chatForm.addEventListener('submit', (e) => this.handleChatSubmission(e));
    }
  }

  async handleChatSubmission(e) {
    e.preventDefault();
    const message = this.userInput.value.trim();
    if (message === '') return;

    // Ensure we have an active chat
    if (!this.chatManager.activeChatId) {
      alert('Please create a chat first.');
      return;
    }

    // Update session ID to active chat ID
    window.sessionId = this.chatManager.activeChatId;

    this.appendMessage('user', message);
    this.userInput.value = '';

    // Disable forms during chat processing
    this.setFormsDisabled(true);

    // Show "thinking" indicator
    const thinkingMessageId = 'thinking_' + Date.now();
    this.appendMessage('bot', this.createThinkingIndicator(thinkingMessageId));

    try {
      console.log('Sending chat...');
      const response = await fetch('https://ocdefonblobupload-ffcwb6frd2gnd0f8.westus2-01.azurewebsites.net/api/SubmitChat?code=zFqYyoEA4aObdFx_IyNtzSMFTLVbrcTypZCRThzIC_anAzFu1xu3iw==', {
        method: 'POST',
        body: JSON.stringify({ 
          Message: message, 
          SessionId: window.sessionId, 
          CaseNumber: window.currentCaseNumber 
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.text();
      
      // Remove thinking indicator
      this.removeThinkingIndicator(thinkingMessageId);
      
      this.appendMessage('bot', result);
      
    } catch (err) {
      console.error('Chat error', err);
      
      // Remove thinking indicator on error
      this.removeThinkingIndicator(thinkingMessageId);
      
      this.appendMessage('bot', 'Sorry, there was an error processing your request: ' + (err && err.message ? err.message : 'unknown error'));
    } finally {
      // Re-enable forms
      this.setFormsDisabled(false);
    }
  }

  createThinkingIndicator(thinkingMessageId) {
    return `<div id="${thinkingMessageId}" style="display: flex; align-items: center; gap: 8px; font-style: italic; opacity: 0.8;"><div style="display: flex; gap: 2px;"><div style="width: 6px; height: 6px; background: #d4af37; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; animation-delay: -0.32s;"></div><div style="width: 6px; height: 6px; background: #d4af37; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; animation-delay: -0.16s;"></div><div style="width: 6px; height: 6px; background: #d4af37; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both;"></div></div>Assistant is thinking...</div><style>@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }</style>`;
  }

  removeThinkingIndicator(thinkingMessageId) {
    const thinkingMsg = document.getElementById(thinkingMessageId);
    if (thinkingMsg) {
      thinkingMsg.closest('.message').remove();
    }
  }

  setFormsDisabled(disabled) {
    const sendBtn = document.getElementById('sendBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileInput');
    
    if (sendBtn) sendBtn.disabled = disabled;
    if (this.userInput) this.userInput.disabled = disabled;
    if (uploadBtn) uploadBtn.disabled = disabled;
    if (fileInput) fileInput.disabled = disabled;
  }

  appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);

    // Bubble only, no avatar
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = text;
    msgDiv.appendChild(bubble);

    this.chatBox.appendChild(msgDiv);
    this.chatBox.scrollTop = this.chatBox.scrollHeight;
    
    // Store message in active chat
    if (this.chatManager.activeChatId) {
      this.chatManager.addMessageToChat(this.chatManager.activeChatId, sender, text);
    }
  }

  updateChatTabs() {
    const tabsList = document.getElementById('chatTabsList');
    if (!tabsList) return;
    
    tabsList.innerHTML = '';
    
    const chats = this.chatManager.getAllChats();
    chats.forEach(chat => {
      const tab = document.createElement('div');
      tab.className = `chat-tab ${chat.id === this.chatManager.activeChatId ? 'active' : ''}`;
      tab.innerHTML = `
        <span title="Chat: ${chat.name}">${chat.name}</span>
        <button class="chat-tab-close" onclick="closeChat('${chat.id}')" title="Close chat">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;
      
      tab.onclick = (e) => {
        if (!e.target.closest('.chat-tab-close')) {
          this.switchToChat(chat.id);
        }
      };
      
      tabsList.appendChild(tab);
    });
  }

  switchToChat(chatId) {
    const chat = this.chatManager.chats.get(chatId);
    if (!chat) return;
    
    this.chatManager.setActiveChat(chatId);
    window.sessionId = chatId;
    
    // Update UI
    this.updateChatTabs();
    
    // Clear and load chat history
    this.clearChatBox();
    this.loadChatHistory(chatId);
    
    console.log('Switched to chat:', chatId, 'Name:', chat.name);
  }

  clearChatBox() {
    if (this.chatBox) {
      this.chatBox.innerHTML = '';
    }
  }

  loadChatHistory(chatId) {
    const chat = this.chatManager.chats.get(chatId);
    if (!chat) return;
    
    chat.messages.forEach(msg => {
      const msgDiv = document.createElement('div');
      msgDiv.classList.add('message', msg.sender);

      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      bubble.innerHTML = msg.message;
      msgDiv.appendChild(bubble);

      this.chatBox.appendChild(msgDiv);
    });
    
    this.chatBox.scrollTop = this.chatBox.scrollHeight;
  }

  focusInput() {
    if (this.userInput) {
      this.userInput.focus();
    }
  }
}

// Global functions for chat management buttons
function createNewChat() {
  if (window.chatManager && window.chatUI) {
    const chatName = `Chat ${window.chatManager.getAllChats().length + 1}`;
    const newChatId = window.chatManager.createChat(chatName);
    window.chatManager.setActiveChat(newChatId);
    window.sessionId = newChatId;
    
    // Update UI
    window.chatUI.updateChatTabs();
    window.chatUI.clearChatBox();
    window.chatUI.focusInput();
    
    console.log('Created new chat:', newChatId, 'Name:', chatName);
  }
}

function closeChat(chatId) {
  if (window.chatManager && window.chatUI) {
    if (window.chatManager.chats.size <= 1) {
      alert('Cannot close the last chat. Please create a new chat first.');
      return;
    }
    
    window.chatManager.removeChat(chatId);
    
    // If we closed the active chat, switch to another one
    if (window.chatManager.activeChatId) {
      const activeChat = window.chatManager.getActiveChat();
      if (activeChat) {
        window.chatUI.switchToChat(activeChat.id);
      }
    } else {
      // No chats left, create a new one
      createNewChat();
    }
    
    window.chatUI.updateChatTabs();
  }
}