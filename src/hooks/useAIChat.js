import { useState, useCallback, useEffect } from 'react';
import * as aiApi from '../api/ai';
import { useExpenseStore } from '../store/expenseStore';
import { useUiStore } from '../store/uiStore';

const WELCOME_MESSAGE = {
  id: 'msg-welcome',
  sender: 'ai',
  text: 'Namaste! 👋 I am XpenZ AI, your smart business spending sidekick. You can type something like "Log ₹650 swiggy meal" or scan any receipt image below to instantly log an expense!',
  timestamp: new Date().toISOString(),
};

export const useAIChat = () => {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const showToast = useUiStore((state) => state.showToast);
  const activeProjectId = useExpenseStore((state) => state.activeProjectId);
  const projects = useExpenseStore((state) => state.projects);
  const fetchProjects = useExpenseStore((state) => state.fetchProjects);

  const projectId = activeProjectId || projects[0]?.id || null;

  useEffect(() => {
    if (!projects.length) {
      fetchProjects();
    }
  }, [projects.length, fetchProjects]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const response = await aiApi.getChatHistory(projectId);
        if (!mounted) return;
        const history = response.data;
        if (history.length) {
          setMessages(history);
        }
      } catch {
        // keep welcome message on failure
      } finally {
        if (mounted) setHistoryLoaded(true);
      }
    })();
    return () => { mounted = false; };
  }, [projectId]);

  const sendMessage = useCallback(async (text, receiptUri = null) => {
    if (!text && !receiptUri) return;

    const userMsg = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: text || 'Parsed Receipt Image',
      receiptUri,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      let queryText = text || '';
      if (receiptUri) {
        queryText = `Log spending from receipt image: ${receiptUri}`;
      }

      const response = await aiApi.sendChatMessage(queryText, projectId);
      const aiMsg = response.data;

      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      showToast('Failed to communicate with AI Assistant.', 'error');

      const fallbackMsg = {
        id: `msg-fallback-${Date.now()}`,
        sender: 'ai',
        text: 'Sorry, I encountered a connection issue. Please check your network and try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  }, [showToast, projectId]);

  const clearChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
  }, []);

  return {
    messages,
    loading,
    historyLoaded,
    sendMessage,
    clearChat,
  };
};

export default useAIChat;
