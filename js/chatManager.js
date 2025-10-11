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