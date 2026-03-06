/**
 * ConversationList Component
 * Displays user's chat history with ability to load past conversations
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useOnboarding } from '../context/OnboardingContext';
import {
  getUserConversations,
  archiveConversation,
  deleteConversation,
} from '../config/firebase';
import designSystem from '../utils/designSystem';

const { colors, spacing, typography, shadows } = designSystem;

export default function ConversationList({
  onSelectConversation,
  onNewConversation,
  currentConversationId,
  isVisible = true,
}) {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { firebaseUser, userProfile } = useOnboarding();
  const userId = firebaseUser?.uid || userProfile?.uid;

  // Load conversations on mount and when userId changes
  useEffect(() => {
    if (userId) {
      loadConversations();
    }
  }, [userId]);

  const loadConversations = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const convos = await getUserConversations(userId, 50);
      setConversations(convos);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadConversations();
  };

  const handleDelete = (conversationId, title) => {
    Alert.alert(
      'Delete Conversation',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteConversation(conversationId);
              setConversations(prev => prev.filter(c => c.id !== conversationId));
              // If deleted conversation was current, start new one
              if (conversationId === currentConversationId && onNewConversation) {
                onNewConversation();
              }
            } catch (error) {
              console.error('Error deleting conversation:', error);
              Alert.alert('Error', 'Failed to delete conversation');
            }
          },
        },
      ]
    );
  };

  const formatDate = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const renderConversationItem = ({ item }) => {
    const isActive = item.id === currentConversationId;

    return (
      <TouchableOpacity
        style={[styles.conversationItem, isActive && styles.activeConversation]}
        onPress={() => onSelectConversation(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.conversationContent}>
          <Text
            style={[styles.conversationTitle, isActive && styles.activeText]}
            numberOfLines={1}
          >
            {item.title || 'New Conversation'}
          </Text>
          <Text style={styles.conversationMeta} numberOfLines={1}>
            {formatDate(item.updatedAt)} · {item.messageCount || 0} messages
          </Text>
          {item.lastMessage && (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage}
            </Text>
          )}
        </View>
        <IconButton
          icon="delete-outline"
          size={18}
          iconColor={colors.neutral[400]}
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id, item.title)}
        />
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Conversations</Text>
      <TouchableOpacity
        style={styles.newChatButton}
        onPress={onNewConversation}
      >
        <IconButton
          icon="plus"
          size={20}
          iconColor={colors.primary[500]}
          style={styles.newChatIcon}
        />
        <Text style={styles.newChatText}>New Chat</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No conversations yet</Text>
      <Text style={styles.emptySubtext}>Start a new chat to begin</Text>
    </View>
  );

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      {renderHeader()}

      {isLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary[500]} />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversationItem}
          ListEmptyComponent={renderEmpty}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
  },
  header: {
    paddingHorizontal: spacing[3],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[900],
    marginBottom: spacing[3],
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  newChatIcon: {
    margin: 0,
    marginRight: spacing[1],
  },
  newChatText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[600],
  },
  listContent: {
    paddingVertical: spacing[2],
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2.5],
    paddingHorizontal: spacing[3],
    borderRadius: 16,
    marginHorizontal: spacing[0],
    marginVertical: spacing[1],
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.xs,
  },
  activeConversation: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderColor: colors.primary[300],
  },
  conversationContent: {
    flex: 1,
    marginRight: spacing[2],
  },
  conversationTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  activeText: {
    color: colors.primary[700],
  },
  conversationMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[500],
    marginBottom: spacing[1],
  },
  lastMessage: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[400],
    fontStyle: 'italic',
  },
  deleteButton: {
    margin: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[8],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[8],
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[600],
    marginBottom: spacing[1],
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
  },
});
