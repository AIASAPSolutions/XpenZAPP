import { request } from './client';
import { normalizeChatMessage, normalizeChatHistory } from './normalizers';

export const sendChatMessage = async (message, projectId = null, conversationId = null) => {
  const res = await request('post', '/chat/expense', {
    message,
    project_id: projectId,
    conversation_id: conversationId,
  });
  return { data: normalizeChatMessage(res.data) };
};

export const getChatHistory = async (projectId = null, conversationId = null) => {
  const res = await request('get', '/chat/history', null, {
    params: {
      ...(projectId ? { project_id: projectId } : {}),
      ...(conversationId ? { conversation_id: conversationId } : {}),
    },
  });
  return { data: normalizeChatHistory(res.data) };
};
