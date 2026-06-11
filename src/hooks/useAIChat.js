import { useState, useCallback } from 'react';
import * as aiApi from '../api/ai';
import { useUiStore } from '../store/uiStore';

const INITIAL_MESSAGES = [
  { id: 'msg-1', sender: 'ai', text: 'Namaste! 👋 I am XpenZ AI, your smart business spending sidekick. You can type something like "Log ₹650 swiggy meal" or scan any receipt image below to instantly log an expense!', timestamp: new Date(Date.now() - 3600000).toISOString() }
];

export const useAIChat = () => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [loading, setLoading] = useState(false);
  const showToast = useUiStore((state) => state.showToast);

  const sendMessage = useCallback(async (text, receiptUri = null) => {
    if (!text && !receiptUri) return;

    // Create user message
    const userMsg = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: text || 'Parsed Receipt Image',
      receiptUri,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      let queryText = text || '';
      if (receiptUri) {
        queryText = `Log spending from receipt image: ${receiptUri}`;
      }
      
      const response = await aiApi.sendChatMessage(queryText);
      const aiMsg = response.data;
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      showToast("Failed to communicate with AI Assistant.", "error");
      
      // Fallback message
      const fallbackMsg = {
        id: `msg-fallback-${Date.now()}`,
        sender: 'ai',
        text: 'Sorry Rahul, I encountered a connection drop. I can still help you! Check your budget or try typing "Log swiggy dinner ₹500".',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const clearChat = useCallback(() => {
    setMessages(INITIAL_MESSAGES);
  }, []);

  return {
    messages,
    loading,
    sendMessage,
    clearChat
  };
};
export default useAIChat;
