/**
 * RootED API Configuration
 * Connects to EC2 backend
 */

import { Platform } from 'react-native';

// Backend URL
// const PRODUCTION_URL = 'http://13.61.162.222:8000';
const LOCAL_URL = 'http://localhost:8000';

// Use production URL (EC2)
// export const API_BASE_URL = PRODUCTION_URL;
export const API_BASE_URL = LOCAL_URL;

/**
 * Send a chat message and get response
 * @param {string} message - User message
 * @param {string} sessionId - Session ID for conversation memory
 * @param {string} userId - Optional user ID
 * @returns {Promise<{response: string, session_id: string, message_count: number}>}
 */
export const sendMessage = async (message, sessionId, userId = null) => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      session_id: sessionId,
      user_id: userId,
    }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};

/**
 * Send a chat message with streaming response
 * @param {string} message - User message
 * @param {string} sessionId - Session ID
 * @param {function} onChunk - Callback for each chunk: (text) => void
 * @param {function} onDone - Callback when complete: (messageCount) => void
 * @param {function} onError - Callback on error: (error) => void
 */
export const sendMessageStream = async (message, sessionId, onChunk, onDone, onError) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        onDone?.();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'chunk') {
              onChunk?.(data.content);
            } else if (data.type === 'done') {
              onDone?.(data.message_count);
            } else if (data.type === 'error') {
              onError?.(new Error(data.content));
            }
          } catch (e) {
            // Ignore parse errors for incomplete chunks
          }
        }
      }
    }
  } catch (error) {
    onError?.(error);
  }
};

/**
 * Get chat history for a session
 * @param {string} sessionId - Session ID
 * @returns {Promise<{messages: Array, session_id: string, message_count: number}>}
 */
export const getChatHistory = async (sessionId) => {
  const response = await fetch(`${API_BASE_URL}/chat/history/${sessionId}`);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};

/**
 * Clear chat history for a session
 * @param {string} sessionId - Session ID
 */
export const clearChatHistory = async (sessionId) => {
  const response = await fetch(`${API_BASE_URL}/chat/history/${sessionId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};

/**
 * Check API health
 * @returns {Promise<{status: string, timestamp: string, version: string, gemini_configured: boolean}>}
 */
export const checkHealth = async () => {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};

export default {
  API_BASE_URL,
  sendMessage,
  sendMessageStream,
  getChatHistory,
  clearChatHistory,
  checkHealth,
};
