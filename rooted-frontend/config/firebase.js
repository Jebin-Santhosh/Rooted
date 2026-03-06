/**
 * Firebase Configuration for RootED
 * Client-side Firebase setup for authentication and Firestore
 *
 * ARCHITECTURE NOTE:
 * - Frontend (this file): READ operations only - auth, reading conversations/progress
 * - Backend (app.py): WRITE operations - saving conversations, updating progress
 *
 * This separation ensures:
 * 1. Cleaner architecture with backend as single source of truth for writes
 * 2. Better security (backend uses Admin SDK with service account)
 * 3. Consistent data handling through the API
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { Platform } from 'react-native';

// Firebase configuration
// const firebaseConfig = {
//   apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
//   authDomain: "rooted-b8903.firebaseapp.com",
//   projectId: "rooted-b8903",
//   storageBucket: "rooted-b8903.firebasestorage.app",
//   messagingSenderId: "615371621072",
//   appId: "1:615371621072:web:a62407b2644d1b8ba894d5",
//   measurementId: "G-V2JQB0J0N6"
// };

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: "rooted-a4947.firebaseapp.com",
  projectId: "rooted-a4947",
  storageBucket: "rooted-a4947.firebasestorage.app",
  messagingSenderId: "715666071325",
  appId: "1:715666071325:web:af00ab95d1193a3d730bf4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google Provider
googleProvider.addScope('profile');
googleProvider.addScope('email');

/**
 * Sign in with Google
 * Works on web, for mobile use expo-auth-session
 */
export const signInWithGoogle = async () => {
  try {
    if (Platform.OS === 'web') {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } else {
      // For mobile, we'll use expo-auth-session (configured separately)
      throw new Error('Use expo-auth-session for mobile Google Sign-In');
    }
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

/**
 * Sign out user
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
};

/**
 * Save user profile to Firestore
 */
export const saveUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Update user profile in Firestore
 */
export const updateUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// ============================================
// CONVERSATION STORAGE FUNCTIONS
// ============================================
//
// READ FUNCTIONS (Frontend use):
//   - getUserConversations() - List conversations for sidebar
//   - getConversation() - Load a conversation's messages
//
// WRITE FUNCTIONS (Backend handles these - kept for reference):
//   - createConversation() - BACKEND ONLY
//   - addMessageToConversation() - BACKEND ONLY
//   - updateConversationTitle() - Can be used from frontend for renaming
//   - archiveConversation() - Can be used from frontend
//   - deleteConversation() - Can be used from frontend
//
// ============================================

/**
 * Database Structure:
 *
 * conversations (collection)
 *   ├─ {conversationId} (document)
 *   │  ├─ userId: string (Firebase UID)
 *   │  ├─ title: string (auto-generated from first message)
 *   │  ├─ createdAt: Timestamp
 *   │  ├─ updatedAt: Timestamp
 *   │  ├─ messageCount: number
 *   │  ├─ lastMessage: string (preview)
 *   │  ├─ isArchived: boolean
 *   │  └─ messages: array of message objects
 *   │     [
 *   │       {
 *   │         id: string,
 *   │         role: 'user' | 'assistant',
 *   │         content: string,
 *   │         timestamp: number (Date.now()),
 *   │         sources?: string[],
 *   │         researchMode?: 'quick' | 'deep'
 *   │       }
 *   │     ]
 */

/**
 * Create a new conversation
 * @param {string} userId - Firebase user ID
 * @param {string} firstMessage - First message to generate title
 * @returns {Promise<string>} - Conversation ID
 */
export const createConversation = async (userId, firstMessage = '') => {
  try {
    const conversationsRef = collection(db, 'conversations');

    // Generate title from first message (first 50 chars or default)
    const title = firstMessage.length > 0
      ? firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : '')
      : 'New Conversation';

    const conversationData = {
      userId,
      title,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      messageCount: 0,
      lastMessage: '',
      isArchived: false,
      messages: []
    };

    const docRef = await addDoc(conversationsRef, conversationData);
    console.log('Created conversation:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

/**
 * Add a message to a conversation
 * @param {string} conversationId - Conversation document ID
 * @param {object} message - Message object { role, content, sources?, researchMode? }
 * @returns {Promise<boolean>}
 */
export const addMessageToConversation = async (conversationId, message) => {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (!conversationSnap.exists()) {
      throw new Error('Conversation not found');
    }

    const currentData = conversationSnap.data();
    const messages = currentData.messages || [];

    // Create message with ID and timestamp
    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: message.role, // 'user' or 'assistant'
      content: message.content,
      timestamp: Date.now(),
      ...(message.sources && { sources: message.sources }),
      ...(message.researchMode && { researchMode: message.researchMode })
    };

    messages.push(newMessage);

    // Update conversation
    await updateDoc(conversationRef, {
      messages,
      messageCount: messages.length,
      lastMessage: message.content.substring(0, 100),
      updatedAt: serverTimestamp(),
      // Update title if this is the first user message
      ...(messages.length === 1 && message.role === 'user' && {
        title: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '')
      })
    });

    return true;
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
};

/**
 * Get all conversations for a user
 * @param {string} userId - Firebase user ID
 * @param {number} maxResults - Maximum number of conversations to return
 * @returns {Promise<Array>} - Array of conversation objects
 */
export const getUserConversations = async (userId, maxResults = 50) => {
  try {
    if (!userId) {
      console.warn('getUserConversations: No userId provided');
      return [];
    }

    const conversationsRef = collection(db, 'conversations');

    // Simple query with just userId filter - no composite index needed
    // We'll filter and sort in memory
    const q = query(
      conversationsRef,
      where('userId', '==', userId),
      limit(100) // Get more to filter archived ones
    );

    const querySnapshot = await getDocs(q);
    const conversations = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      // Filter out archived conversations in memory
      if (!data.isArchived) {
        conversations.push({
          id: docSnap.id,
          ...data,
          // Convert Firestore Timestamp to JS Date for easier handling
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        });
      }
    });

    // Sort by updatedAt descending in memory
    conversations.sort((a, b) => b.updatedAt - a.updatedAt);

    // Limit results
    return conversations.slice(0, maxResults);
  } catch (error) {
    console.error('Error getting conversations:', error);
    // Return empty array instead of throwing to prevent UI crashes
    return [];
  }
};

/**
 * Get a single conversation with all messages
 * @param {string} conversationId - Conversation document ID
 * @returns {Promise<object|null>} - Conversation object with messages
 */
export const getConversation = async (conversationId) => {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (!conversationSnap.exists()) {
      return null;
    }

    const data = conversationSnap.data();
    return {
      id: conversationSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date()
    };
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
};

/**
 * Update conversation title
 * @param {string} conversationId - Conversation document ID
 * @param {string} title - New title
 * @returns {Promise<boolean>}
 */
export const updateConversationTitle = async (conversationId, title) => {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      title,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating conversation title:', error);
    throw error;
  }
};

/**
 * Archive a conversation (soft delete)
 * @param {string} conversationId - Conversation document ID
 * @returns {Promise<boolean>}
 */
export const archiveConversation = async (conversationId) => {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      isArchived: true,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error archiving conversation:', error);
    throw error;
  }
};

/**
 * Permanently delete a conversation
 * @param {string} conversationId - Conversation document ID
 * @returns {Promise<boolean>}
 */
export const deleteConversation = async (conversationId) => {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    await deleteDoc(conversationRef);
    return true;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};

/**
 * Save entire conversation at once (for batch updates)
 * @param {string} conversationId - Conversation document ID
 * @param {Array} messages - Array of message objects
 * @returns {Promise<boolean>}
 */
export const saveConversationMessages = async (conversationId, messages) => {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);

    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');

    await updateDoc(conversationRef, {
      messages,
      messageCount: messages.length,
      lastMessage: messages[messages.length - 1]?.content?.substring(0, 100) || '',
      updatedAt: serverTimestamp(),
      // Update title from first user message if not set
      ...(messages.length > 0 && messages[0].role === 'user' && {
        title: messages[0].content.substring(0, 50) + (messages[0].content.length > 50 ? '...' : '')
      })
    });

    return true;
  } catch (error) {
    console.error('Error saving conversation messages:', error);
    throw error;
  }
};

// ============================================
// LEARNING PROGRESS TRACKING
// ============================================
//
// READ FUNCTIONS (Frontend use):
//   - getUserProgress() - Get progress stats for dashboard
//
// WRITE FUNCTIONS (Backend handles):
//   - updateUserProgress() - BACKEND ONLY (called after each message)
//
// ============================================

/**
 * Progress Structure:
 * users/{userId}/progress/stats (document)
 *   ├─ totalConversations: number
 *   ├─ totalMessages: number
 *   ├─ topicsExplored: string[]
 *   ├─ quizzesTaken: number
 *   ├─ quizzesCorrect: number
 *   ├─ learningStreak: number (consecutive days)
 *   ├─ lastActiveDate: string (YYYY-MM-DD)
 *   ├─ weeklyActivity: { [dayOfWeek]: number }
 */

/**
 * Get or create user progress document
 */
export const getUserProgress = async (userId) => {
  try {
    const progressRef = doc(db, 'users', userId, 'progress', 'stats');
    const progressSnap = await getDoc(progressRef);

    if (progressSnap.exists()) {
      return progressSnap.data();
    }

    // Create initial progress document
    const initialProgress = {
      totalConversations: 0,
      totalMessages: 0,
      topicsExplored: [],
      quizzesTaken: 0,
      quizzesCorrect: 0,
      learningStreak: 0,
      lastActiveDate: null,
      weeklyActivity: { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(progressRef, initialProgress);
    return initialProgress;
  } catch (error) {
    console.error('Error getting user progress:', error);
    return null;
  }
};

/**
 * Update user progress after activity
 */
export const updateUserProgress = async (userId, updates = {}) => {
  try {
    const progressRef = doc(db, 'users', userId, 'progress', 'stats');
    const progressSnap = await getDoc(progressRef);

    const today = new Date().toISOString().split('T')[0];
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];

    let currentProgress = progressSnap.exists() ? progressSnap.data() : {};

    // Calculate streak
    let newStreak = currentProgress.learningStreak || 0;
    const lastActive = currentProgress.lastActiveDate;

    if (lastActive) {
      const lastDate = new Date(lastActive);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) newStreak++;
      else if (diffDays > 1) newStreak = 1;
    } else {
      newStreak = 1;
    }

    // Update weekly activity
    const weeklyActivity = currentProgress.weeklyActivity || {
      Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0
    };
    weeklyActivity[dayOfWeek] = (weeklyActivity[dayOfWeek] || 0) + (updates.messagesAdded || 0);

    const updateData = {
      learningStreak: newStreak,
      lastActiveDate: today,
      weeklyActivity,
      updatedAt: serverTimestamp(),
    };

    // Increment counters
    if (updates.messagesAdded) {
      updateData.totalMessages = (currentProgress.totalMessages || 0) + updates.messagesAdded;
    }
    if (updates.conversationsAdded) {
      updateData.totalConversations = (currentProgress.totalConversations || 0) + updates.conversationsAdded;
    }

    await setDoc(progressRef, updateData, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating user progress:', error);
    return false;
  }
};

export { auth, db, googleProvider, serverTimestamp as firestoreTimestamp };
export default app;
