import { request } from './client';

export const sendChatMessage = (message) => {
  return request('post', '/ai/chat', { message });
};
