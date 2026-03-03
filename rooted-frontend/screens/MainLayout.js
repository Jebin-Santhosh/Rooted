/**
 * MainLayout
 * RootED - Clean dental AI chat layout
 * Responsive with collapsible sidebar overlay
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Sidebar from '../components/Sidebar';
import ChatScreen from './ChatScreen';
import PDFSidePanel from '../components/PDFSidePanel';
import { useOnboarding } from '../context/OnboardingContext';
import { getUserConversations } from '../config/firebase';
import apiService from '../services/api';
import designSystem from '../utils/designSystem';
import { useThemeMode } from '../context/ThemeContext';

const {
  colors,
  spacing,
  breakpoints,
} = designSystem;

const SIDEBAR_WIDTH = 280;
const ACTIVE_CONVERSATION_KEY = '@rooted_active_conversation_id';

export default function MainLayout({ navigation }) {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [chatKey, setChatKey] = useState(0); // Force re-render of ChatScreen
  const [pdfPanel, setPdfPanel] = useState({ isOpen: false, docIndex: null, pageNumber: null, title: '', url: '' });
  const insets = useSafeAreaInsets();
  const { firebaseUser } = useOnboarding();
  const { isDark, toggleTheme } = useThemeMode();

  // Check if we're on a large screen (desktop)
  const isLargeScreen = dimensions.width >= breakpoints.lg;

  // On large screens, sidebar is always visible and not overlay
  // On small screens, sidebar is overlay and starts closed
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  // Auto-open sidebar on large screens
  useEffect(() => {
    if (isLargeScreen) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, [isLargeScreen]);

  // Fetch chat history from Firebase
  const loadChatHistory = useCallback(async () => {
    if (!firebaseUser?.uid) {
      console.log('loadChatHistory: No firebaseUser uid');
      return;
    }

    try {
      console.log('loadChatHistory: Fetching for user', firebaseUser.uid);
      const conversations = await getUserConversations(firebaseUser.uid);
      console.log('loadChatHistory: Got', conversations.length, 'conversations');

      // Restore active conversation on refresh:
      // - prefer current state
      // - else try last selected from AsyncStorage (if still exists)
      // - else default to most recent conversation
      let activeId = currentConversationId;
      if (!activeId && conversations.length > 0) {
        let storedId = null;
        try {
          storedId = await AsyncStorage.getItem(ACTIVE_CONVERSATION_KEY);
        } catch (e) {
          console.warn('Failed to read active conversation id:', e);
        }
        const ids = conversations.map(c => c.id);
        activeId = storedId && ids.includes(storedId) ? storedId : conversations[0].id;
        if (activeId) {
          setCurrentConversationId(activeId);
          apiService.setConversationId(activeId);
          setChatKey(prev => prev + 1); // force ChatScreen to hydrate
        }
      }

      const formattedHistory = conversations.map(conv => ({
        id: conv.id,
        title: conv.title || 'New Conversation',
        isActive: conv.id === activeId,
        updatedAt: conv.updatedAt,
      }));
      setChatHistory(formattedHistory);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }, [firebaseUser?.uid, currentConversationId]);

  // Load chat history on mount and when user changes
  useEffect(() => {
    if (firebaseUser?.uid) {
      console.log('MainLayout: firebaseUser available, loading history for', firebaseUser.uid);
      loadChatHistory();
    }
  }, [firebaseUser?.uid, loadChatHistory]);

  // Fallback: if history is loaded but no chat selected, open the most recent
  useEffect(() => {
    if (!currentConversationId && chatHistory.length > 0) {
      const fallbackId = chatHistory[0]?.id;
      if (fallbackId) {
        console.log('MainLayout: auto-opening most recent conversation', fallbackId);
        setCurrentConversationId(fallbackId);
        apiService.setConversationId(fallbackId);
        AsyncStorage.setItem(ACTIVE_CONVERSATION_KEY, fallbackId).catch(() => {});
        setChatHistory(prev => prev.map(c => ({ ...c, isActive: c.id === fallbackId })));
        setChatKey(prev => prev + 1);
      }
    }
  }, [chatHistory, currentConversationId]);

  const handleNavigate = (screen, params) => {
    if (screen === 'chat' && params?.chatId) {
      // Load existing conversation
      setCurrentConversationId(params.chatId);
      AsyncStorage.setItem(ACTIVE_CONVERSATION_KEY, params.chatId).catch(() => {});
      setChatHistory(prev => prev.map(chat => ({
        ...chat,
        isActive: chat.id === params.chatId,
      })));
      setChatKey(prev => prev + 1); // Force ChatScreen to reload
    }
    if (!isLargeScreen) {
      setSidebarOpen(false);
    }
  };

  const handleNewChat = () => {
    // Clear current conversation to start fresh
    setCurrentConversationId(null);
    apiService.setConversationId(null);
    AsyncStorage.removeItem(ACTIVE_CONVERSATION_KEY).catch(() => {});
    setChatHistory(prev => prev.map(chat => ({ ...chat, isActive: false })));
    setChatKey(prev => prev + 1); // Force ChatScreen to reload
    if (!isLargeScreen) {
      setSidebarOpen(false);
    }
  };

  // Called when a new conversation is created
  const handleNewConversation = (conversationId) => {
    console.log('handleNewConversation:', conversationId);
    setCurrentConversationId(conversationId);
    if (conversationId) {
      AsyncStorage.setItem(ACTIVE_CONVERSATION_KEY, conversationId).catch(() => {});
    }
    // Delay reload to give backend time to save to Firebase
    setTimeout(() => {
      loadChatHistory();
    }, 1500);
  };

  const handleCloseSidebar = () => {
    if (!isLargeScreen) {
      setSidebarOpen(false);
    }
  };

  const handleOpenPDF = (docIndex, pageNumber, title, url) => {
    setPdfPanel({
      isOpen: true,
      docIndex,
      pageNumber,
      title,
      url,
    });
  };

  const handleClosePDF = () => {
    setPdfPanel(prev => ({ ...prev, isOpen: false }));
  };

  // Calculate main content margin for desktop when sidebar is open
  const mainContentStyle = [
    styles.mainContent,
    isDark && styles.mainContentDark,
    isLargeScreen && sidebarOpen && { marginLeft: SIDEBAR_WIDTH },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.outer}>
        {/* Glassy shell around the main experience */}
        <BlurView
          intensity={45}
          tint={isDark ? 'dark' : 'light'}
          style={[styles.glassShell, isDark && styles.glassShellDark]}
        >
          {/* Theme toggle - icon-only button in top-right corner */}
          <TouchableOpacity
            style={[
              styles.themeToggleButton,
              { top: (insets.top || spacing[3]) + spacing[1] },
              isDark && styles.themeToggleButtonDark,
            ]}
            onPress={toggleTheme}
            activeOpacity={0.8}
            accessibilityRole="switch"
            accessibilityLabel="Toggle dark mode"
            accessibilityState={{ checked: isDark }}
          >
            <Text style={styles.themeToggleEmoji}>{isDark ? '🌙' : '☀️'}</Text>
          </TouchableOpacity>
          {/* Sidebar - Rendered first so it's behind content on desktop */}
          <Sidebar
            isOpen={sidebarOpen}
            onClose={handleCloseSidebar}
            onNavigate={handleNavigate}
            chatHistory={chatHistory}
            onNewChat={handleNewChat}
            isLargeScreen={isLargeScreen}
          />

          {/* Main Content - Pushed right on desktop when sidebar open */}
          <View style={mainContentStyle}>
            {/* Top Bar - minimal, just menu toggle */}
            <View style={[styles.topBar, { paddingTop: insets.top || spacing[3] }]}>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setSidebarOpen(!sidebarOpen)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="menu" size={24} color={colors.neutral[600]} />
              </TouchableOpacity>
            </View>

            {/* Chat Content */}
            <View style={styles.contentArea}>
              <ChatScreen
                key={chatKey}
                navigation={navigation}
                onOpenPDF={handleOpenPDF}
                conversationId={currentConversationId}
                onNewConversation={handleNewConversation}
              />
            </View>
          </View>

          {/* PDF Side Panel */}
          <PDFSidePanel
            isOpen={pdfPanel.isOpen}
            onClose={handleClosePDF}
            docIndex={pdfPanel.docIndex}
            pageNumber={pdfPanel.pageNumber}
            title={pdfPanel.title}
            url={pdfPanel.url}
          />
        </BlurView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  outer: {
    flex: 1,
    paddingHorizontal: spacing[3],
    paddingBottom: spacing[3],
  },
  glassShell: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  glassShellDark: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderColor: 'rgba(15, 23, 42, 0.95)',
  },
  mainContent: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  mainContentDark: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing[3],
    paddingBottom: spacing[2],
    backgroundColor: 'transparent',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  themeToggleButton: {
    position: 'absolute',
    right: spacing[3],
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(241, 245, 249, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.6)',
    zIndex: 20,
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
  themeToggleButtonDark: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderColor: 'rgba(148, 163, 184, 0.5)',
  },
  themeToggleEmoji: {
    fontSize: 18,
  },
  contentArea: {
    flex: 1,
  },
});
