/**
 * ChatScreen
 * ChatGPT-style clean chat interface
 * Backend handles Firebase persistence - frontend only reads
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import apiService from '../services/api';
import { MESSAGE_TYPES, RESPONSE_TYPES } from '../types';
import MessageBubble from '../components/MessageBubble';
import InlineMCQ from '../components/InlineMCQ';
import DocumentBadge, { ReasoningCard } from '../components/DocumentBadge';
import ChatInput from '../components/ChatInput';
import TypingIndicator from '../components/TypingIndicator';
import WelcomeScreen from '../components/WelcomeScreen';
import { useOnboarding } from '../context/OnboardingContext';
import { getConversation } from '../config/firebase';
import designSystem from '../utils/designSystem';
import { TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';


const {
  colors,
  spacing,
  typography,
  scale,
  isWeb,
} = designSystem;

export default function ChatScreen({ navigation, onOpenPDF, conversationId: initialConversationId, onNewConversation }) {
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [mode, setMode] = useState("diagnose"); // default
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentDocuments, setCurrentDocuments] = useState({});
  const [streamingMessage, setStreamingMessage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);


  const flatListRef = useRef(null);
  const insets = useSafeAreaInsets();
  const { userProfile, firebaseUser } = useOnboarding();

  // Get user's first name and ID
  const userName = userProfile?.firstName || 'there';
  const userId = firebaseUser?.uid || userProfile?.uid;

  // Configure API service with user ID and conversation ID
  useEffect(() => {
    if (userId) {
      apiService.setUserId(userId);
    }
  }, [userId]);

  // Set conversation ID on API service when loading existing conversation
  useEffect(() => {
    if (initialConversationId) {
      apiService.setConversationId(initialConversationId);
    } else {
      // New conversation - clear any existing ID so a new one is generated
      apiService.setConversationId(null);
    }
  }, [initialConversationId]);

  useEffect(() => {
    testConnection();
  }, []);

  // Load existing conversation if conversationId is provided
  useEffect(() => {
    if (initialConversationId && userId) {
      loadConversation(initialConversationId);
    } else if (!initialConversationId) {
      // Clear when switching to a new chat (prevents showing stale messages)
      setMessages([]);
    }
  }, [initialConversationId, userId]);

  const loadConversation = async (convId) => {
    try {
      console.log('ChatScreen: loading conversation', convId);
      const conversation = await getConversation(convId);
      if (conversation && Array.isArray(conversation.messages)) {
        const toDate = (ts) => {
          // Supports: number (Date.now), ISO string, Firestore Timestamp, JS Date
          if (!ts) return new Date();
          if (typeof ts === 'number') return new Date(ts);
          if (typeof ts === 'string') return new Date(ts);
          if (ts instanceof Date) return ts;
          if (typeof ts?.toDate === 'function') return ts.toDate(); // Firestore Timestamp
          return new Date();
        };

        // Convert stored messages to component format
        const loadedMessages = conversation.messages.map((msg, idx) => ({
          id: msg.id || `msg_${convId}_${idx}`,
          type: msg.role === 'user' ? MESSAGE_TYPES.USER : MESSAGE_TYPES.ASSISTANT,
          content: msg.content || '',
          image: msg.image || null,
          timestamp: toDate(msg.timestamp),
          metadata: msg.sources ? { sources: msg.sources } : null,
        }));
        loadedMessages.sort((a, b) => (a.timestamp?.getTime?.() || 0) - (b.timestamp?.getTime?.() || 0));
        console.log('ChatScreen: loaded messages', loadedMessages.length);
        setMessages(loadedMessages);
        apiService.setConversationId(convId);
      } else {
        console.log('ChatScreen: conversation missing messages array', conversation ? Object.keys(conversation) : null);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const testConnection = async () => {
    try {
      await apiService.healthCheck();
    } catch (error) {
      console.error('API connection failed:', error);
    }
  };

  const handlePickImage = async () => {
    try {
      // Ask permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
      if (!permissionResult.granted) {
        alert('Permission to access gallery is required!');
        return;
      }
  
      // Open image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });
  
      if (!result.canceled) {
        const image = result.assets[0];
        console.log("Selected image:", image);

              // Show image message
      const userImageMessage = {
        id: Date.now().toString(),
        type: MESSAGE_TYPES.USER,
        content: '',
        image: image.uri,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userImageMessage]);
  
        // Next step → send this image to backend
        await sendImageToBackend(image);
      }
    } catch (error) {
      console.error("Image pick error:", error);
    }
  };


const sendImageToBackend = async (image) => {
  try {
    setIsLoading(true);

    const formData = new FormData();

    if (Platform.OS === 'web' || isWeb) {
      // On web, we must send a real Blob/File, not a plain object
      const response = await fetch(image.uri);
      const blob = await response.blob();
      formData.append('file', blob, 'dental_image.jpg');
    } else {
      // Native (iOS/Android) can use the { uri, name, type } pattern
      formData.append('file', {
        uri: image.uri,
        name: 'dental_image.jpg',
        type: image.mimeType || 'image/jpeg',
      });
    }

    const uploadResponse = await fetch(`${apiService.baseURL}/diagnose/image`, {
      method: 'POST',
      body: formData,
      // ❌ DO NOT SET CONTENT-TYPE HERE – let fetch set multipart boundary
    });

    const data = await uploadResponse.json();

    const analysisText =
      typeof data === 'object' && data !== null && typeof data.analysis === 'string'
        ? data.analysis
        : JSON.stringify(data, null, 2);

    const assistantMessage = {
      id: Date.now().toString(),
      type: MESSAGE_TYPES.ASSISTANT,
      content: analysisText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);

  } catch (error) {
    console.error("Upload error:", error);
  } finally {
    setIsLoading(false);
  }
};


  const scrollToBottom = useCallback(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return;

    const isNewConversation = messages.length === 0;
    const userMessage = {
      id: Date.now().toString(),
      type: MESSAGE_TYPES.USER,
      content: messageText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      let assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: MESSAGE_TYPES.ASSISTANT,
        content: '',
        timestamp: new Date(),
        metadata: null,
        researchMode: null,
      };

      setStreamingMessage(assistantMessage.id);
      let hasAddedMessage = false;
      let finalContent = '';

      const responseIterator = apiService.sendChatMessage(
        messageText.trim(),
        mode
      );


      for await (const chunk of responseIterator) {
        if (chunk.type === RESPONSE_TYPES.CHUNK) {
          setIsTyping(false);

          if (!hasAddedMessage) {
            setMessages(prev => [...prev, assistantMessage]);
            hasAddedMessage = true;
          }

          finalContent += chunk.content;
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessage.id
                ? { ...msg, content: msg.content + chunk.content, metadata: assistantMessage.metadata }
                : msg
            )
          );
          scrollToBottom();
        } else if (chunk.type === 'sources') {
          // Capture sources from backend
          assistantMessage.metadata = { sources: chunk.content };
        } else if (chunk.type === 'done') {
          // Capture research mode from done event
          if (chunk.research_mode) {
            assistantMessage.researchMode = chunk.research_mode;
          }
          // Capture conversation ID if returned by backend
          if (chunk.conversation_id) {
            apiService.setConversationId(chunk.conversation_id);
          }
          // Notify parent about new conversation ID from backend
          const convId = apiService.getConversationId();
          console.log('Chat done - isNewConversation:', isNewConversation, 'convId:', convId);
          if (isNewConversation && onNewConversation && convId) {
            onNewConversation(convId);
          }
        } else if (chunk.type === RESPONSE_TYPES.ERROR) {
          setIsTyping(false);
          if (!hasAddedMessage) {
            setMessages(prev => [...prev, assistantMessage]);
            hasAddedMessage = true;
          }
          finalContent = `Error: ${chunk.content}`;
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessage.id
                ? { ...msg, content: finalContent, error: true }
                : msg
            )
          );
        }
      }

      // Backend handles saving to Firebase - no frontend save needed
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      const errorMessage = {
        id: (Date.now() + 2).toString(),
        type: MESSAGE_TYPES.ASSISTANT,
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date(),
        error: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      setStreamingMessage(null);
      scrollToBottom();
    }
  };

  const handleSendMessage = () => {
    sendMessage(inputText);
  };

  const handleCitationPress = (pageNumber) => {
    const docIndices = Object.keys(currentDocuments);
    if (docIndices.length === 0) return;

    const docIndex = docIndices[0];
    const doc = currentDocuments[docIndex];
    const url = apiService.getPDFUrl(docIndex) + `#page=${pageNumber}`;

    // Open PDF in side panel instead of navigating
    if (onOpenPDF) {
      onOpenPDF(docIndex, pageNumber, doc.title, url);
    } else {
      // Fallback to navigation if onOpenPDF not provided
      navigation.navigate('PDFViewer', {
        docIndex,
        pageNumber,
        title: doc.title,
        url,
      });
    }
  };

  const handleMCQSubmit = async (answers, questions) => {
    try {
      const result = await apiService.submitMCQAnswers(answers, questions);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const renderMessage = useCallback(({ item }) => {
    if (item.type === MESSAGE_TYPES.USER) {
      return <MessageBubble message={item} isUser={true} />;
    }

    if (item.type === MESSAGE_TYPES.MCQ) {
      return (
        <View style={styles.mcqMessageContainer}>
          <View style={styles.mcqContent}>
            <InlineMCQ
              mcqData={item.mcqData}
              onSubmit={(answers) => handleMCQSubmit(answers, item.mcqData.questions)}
            />
          </View>
        </View>
      );
    }

    return (
      <View>
        {item.metadata?.titles?.length > 0 && (
          <View style={styles.documentBadgesContainer}>
            {item.metadata.titles.map((title, idx) => (
              <DocumentBadge key={idx} title={title} index={idx} />
            ))}
          </View>
        )}

        {item.metadata?.reasoning && (
          <ReasoningCard reasoning={item.metadata.reasoning} />
        )}

        <MessageBubble
          message={item}
          isUser={false}
          onCitationPress={handleCitationPress}
          isStreaming={streamingMessage === item.id}
        />
      </View>
    );
  }, [streamingMessage, handleCitationPress]);

  const renderFooter = () => {
    if (!isTyping) return null;
    return <TypingIndicator />;
  };

  // Show welcome screen when no messages
  if (messages.length === 0) {
    return (
      <View style={styles.container}>
        <WelcomeScreen
          userName={userName}
          inputValue={inputText}
          onChangeText={setInputText}
          onSend={handleSendMessage}
          isLoading={isLoading}
        />
      </View>
    );
  }


return (
  <View style={styles.container}>

{/* Floating Mode Selector */}
<View style={styles.fabContainer} pointerEvents="box-none">

      {/* Popup Menu */}
      {showModeMenu && (
        <View style={styles.modeMenu}>
          <TouchableOpacity
            style={styles.modeOption}
            onPress={() => {
              setMode("diagnose");
              setShowModeMenu(false);
            }}
          >
            <Text style={styles.modeOptionText}>🦷 Default Mode</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modeOption}
            onPress={() => {
              setMode("deep");
              setShowModeMenu(false);
            }}
          >
            <Text style={styles.modeOptionText}>🔬 Deep Research</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Circular FAB */}
      <TouchableOpacity
        style={[
          styles.fabButton,
          mode === "deep" && styles.fabButtonActive
        ]}
        onPress={() => setShowModeMenu(prev => !prev)}
      >
        <Text style={styles.fabText}>
          {mode === "deep" ? "🔬" : "🦷"}
        </Text>
      </TouchableOpacity>

    </View>

    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={scrollToBottom}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      />

      {messages.length > 0 && (
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <ChatInput
              value={inputText}
              onChangeText={setInputText}
              onSend={handleSendMessage}
              isLoading={isLoading}
              onPickImage={handlePickImage}
              placeholder="Ask anything"
              onPressPlus={() => setShowAttachmentMenu(prev => !prev)}
              
            />
          </View>
          <Text style={styles.disclaimer}>
            RootED can make mistakes. Verify important information.
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>

  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardView: {
    flex: 1,
  },
  messagesList: {
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
    paddingHorizontal: spacing[4],
  },
  emptyList: {
    flex: 1,
  },
  documentBadgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing[1],
    maxWidth: isWeb ? 700 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  mcqMessageContainer: {
    paddingVertical: spacing[2],
    maxWidth: isWeb ? 700 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  mcqContent: {
    flex: 1,
  },
  inputWrapper: {
    backgroundColor: 'transparent',
    paddingTop: spacing[2],
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    alignItems: 'center',
  },
  inputContainer: {
    maxWidth: isWeb ? 700 : '100%',
    width: '100%',
  },
  disclaimer: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[400],
    marginTop: spacing[2],
    textAlign: 'center',
  },
  fabContainer: {
    position: "absolute",
    bottom: 35,     // slightly above input box
    right: 20,
    alignItems: "flex-end",  // prevents left shift
    zIndex: 999,
  },

  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  fabButtonActive: {
    backgroundColor: "#ff6b6b",
  },

  fabText: {
    fontSize: 24,
  },

  modeMenu: {
    position: "absolute",
    bottom: 75,      // places popup above FAB
    right: 0,        // locks to right side
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 8,
    minWidth: 160,
  },

  modeOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },

  modeOptionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  attachmentMenu: {
  position: 'absolute',
  bottom: 110,
  left: 20,
  backgroundColor: '#fff',
  borderRadius: 12,
  paddingVertical: 8,
  paddingHorizontal: 12,
  elevation: 5,
  shadowColor: '#000',
  shadowOpacity: 0.2,
  shadowRadius: 6,
  },

  attachmentOption: {
    paddingVertical: 6,
  },

  attachmentText: {
    fontSize: 14,
    fontWeight: '500',
  },

});






