import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configuration - EC2 Backend
// const EC2_BACKEND = 'http://13.61.162.222:8000';
const EC2_BACKEND = 'http://127.0.0.1:8000';

// Check if running on localhost (development) or production
const isLocalDev = () => {
  if (Platform.OS !== 'web') return false;
  if (typeof window === 'undefined') return false;
  const hostname = window.location?.hostname || '';
  return hostname === 'localhost' || hostname === '127.0.0.1';
};

// Use relative /api path on production web (goes through Vercel proxy)
// Use direct EC2 URL on local dev and native apps
const getApiBaseUrl = () => {
  if (Platform.OS === 'web' && !isLocalDev()) {
    // Production web - use Vercel proxy
    return '/api';
  }
  // Local dev or native - connect directly to EC2
  return EC2_BACKEND;
};

class ApiService {
  constructor() {
    this.baseURL = getApiBaseUrl();
    this.userId = null;
    this.conversationId = null;
  }

  // Set Firebase user ID (call after auth)
  setUserId(userId) {
    this.userId = userId;
  }

  // Set current conversation ID
  setConversationId(conversationId) {
    this.conversationId = conversationId;
  }

  // Get current conversation ID
  getConversationId() {
    return this.conversationId;
  }

  // Generate a new conversation ID (for new chats)
  generateConversationId() {
    this.conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return this.conversationId;
  }

  // Generate or get session ID
  async getSessionId() {
    try {
      let sessionId = await AsyncStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('sessionId', sessionId);
      }
      return sessionId;
    } catch (error) {
      console.error('Error getting session ID:', error);
      return `session_${Date.now()}`;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }


async diagnose(symptoms) {
  const response = await fetch(`${this.baseURL}/diagnose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symptoms })
  });

  if (!response.ok) {
    throw new Error("Diagnosis failed");
  }

  return await response.json();
}



  // Send chat message with streaming response
  async *sendChatMessage(message, mode = "diagnose", onProgress = null) {
    const sessionId = await this.getSessionId();

    // Generate new conversation ID if not set (new conversation)
    if (!this.conversationId) {
      this.generateConversationId();
    }

    console.log('sendChatMessage:', {
      message: message.substring(0, 50),
      user_id: this.userId,
      conversation_id: this.conversationId,
      session_id: sessionId,
    });

    try {
      const response = await fetch(`${this.baseURL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          mode,
          session_id: sessionId,
          user_id: this.userId,
          conversation_id: this.conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (onProgress) {
                onProgress(data);
              }

              // Map backend response types to frontend types
              if (data.type === 'chunk') {
                yield { type: 'chunk', content: data.content };
              } else if (data.type === 'done') {
                yield { type: 'done', message_count: data.message_count };
              } else if (data.type === 'error') {
                yield { type: 'error', content: data.content };
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat request failed:', error);
      yield { type: 'error', content: error.message };
    }
  }

  // Non-streaming chat (for simpler use cases)
  async sendMessage(message) {
    const sessionId = await this.getSessionId();

    // Generate new conversation ID if not set (new conversation)
    if (!this.conversationId) {
      this.generateConversationId();
    }

    try {
      const response = await fetch(`${this.baseURL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          mode,
          session_id: sessionId,
          user_id: this.userId,
          conversation_id: this.conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Chat request failed:', error);
      throw error;
    }
  }

  // Get chat history
  async getChatHistory() {
    const sessionId = await this.getSessionId();

    try {
      const response = await fetch(`${this.baseURL}/chat/history/${sessionId}`);
      return await response.json();
    } catch (error) {
      console.error('Get history failed:', error);
      throw error;
    }
  }

  // Clear chat history
  async clearChatHistory() {
    const sessionId = await this.getSessionId();

    try {
      const response = await fetch(`${this.baseURL}/chat/history/${sessionId}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      console.error('Clear history failed:', error);
      throw error;
    }
  }

  // Submit MCQ answers (placeholder for future)
  async submitMCQAnswers(answers, questions) {
    // MCQ not implemented in simple backend yet
    return {
      score: 0,
      total: questions.length,
      results: [],
    };
  }

  // Get PDF URL (placeholder for future)
  getPDFUrl(docIndex) {
    return `${this.baseURL}/pdf/${docIndex}`;
  }
}

export default new ApiService();
