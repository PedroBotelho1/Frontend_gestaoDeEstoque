// services/ChatStorageService.js

const CHAT_STORAGE_KEY = 'offline_chats';

export const ChatStorageService = {
  // Salvar mensagem offline
  saveOfflineMessage: (roomId, message) => {
    try {
      const chats = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY)) || {};
      if (!chats[roomId]) {
        chats[roomId] = [];
      }
      chats[roomId].push({
        ...message,
        offline: true,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chats));
      return true;
    } catch (error) {
      console.error('Erro ao salvar mensagem offline:', error);
      return false;
    }
  },

  // Obter mensagens offline de uma sala
  getOfflineMessages: (roomId) => {
    try {
      const chats = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY)) || {};
      return chats[roomId] || [];
    } catch (error) {
      console.error('Erro ao obter mensagens offline:', error);
      return [];
    }
  },

  // Limpar mensagens offline de uma sala
  clearOfflineMessages: (roomId) => {
    try {
      const chats = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY)) || {};
      if (chats[roomId]) {
        delete chats[roomId];
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chats));
      }
      return true;
    } catch (error) {
      console.error('Erro ao limpar mensagens offline:', error);
      return false;
    }
  },

  // Sincronizar mensagens offline com o servidor
  syncOfflineMessages: async (roomId, syncFunction) => {
    try {
      const offlineMessages = ChatStorageService.getOfflineMessages(roomId);
      if (offlineMessages.length > 0) {
        for (const message of offlineMessages) {
          await syncFunction(message);
        }
        ChatStorageService.clearOfflineMessages(roomId);
      }
    } catch (error) {
      console.error('Erro ao sincronizar mensagens offline:', error);
    }
  }
};

export default ChatStorageService;