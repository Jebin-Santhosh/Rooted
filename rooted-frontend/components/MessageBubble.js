/**
 * MessageBubble Component
 * Modern chat bubble with citations and markdown - Web compatible
 */

import React, { memo } from 'react';
import { View, StyleSheet, Platform, Pressable, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import designSystem from '../utils/designSystem';
import { useThemeMode } from '../context/ThemeContext';

const {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  scale,
} = designSystem;

// Parse markdown and citations
const parseContent = (content, onCitationPress, isUser, isDark) => {
  if (!content) return null;
  if (isUser) {
    return <Text style={styles.userText}>{content}</Text>;
  }

  // Split by markdown patterns and citations
  // Handle: **bold**, *italic*, (Page X)
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|\(Page \d+\))/g;
  const parts = content.split(regex);

  const baseAssistantTextStyle = isDark ? styles.assistantTextDark : styles.assistantText;
  const boldStyle = isDark ? styles.boldTextDark : styles.boldText;
  const citationStyle = isDark ? styles.citationTextDark : styles.citationText;

  return (
    <Text style={baseAssistantTextStyle}>
      {parts.map((part, index) => {
        if (!part) return null;

        // Bold text **text**
        const boldMatch = part.match(/^\*\*(.+)\*\*$/);
        if (boldMatch) {
          return (
            <Text key={index} style={boldStyle}>
              {boldMatch[1]}
            </Text>
          );
        }

        // Italic text *text*
        const italicMatch = part.match(/^\*([^*]+)\*$/);
        if (italicMatch) {
          return (
            <Text key={index} style={styles.italicText}>
              {italicMatch[1]}
            </Text>
          );
        }

        // Citation (Page X)
        const citationMatch = part.match(/\(Page (\d+)\)/);
        if (citationMatch) {
          const pageNumber = parseInt(citationMatch[1], 10);
          return (
            <Text
              key={index}
              style={citationStyle}
              onPress={() => onCitationPress && onCitationPress(pageNumber)}
            >
              {part}
            </Text>
          );
        }

        return <Text key={index}>{part}</Text>;
      })}
    </Text>
  );
};

const MessageBubble = memo(function MessageBubble({
  message,
  isUser,
  onCitationPress,
  isStreaming = false,
}) {
  const { isDark } = useThemeMode();

  const bubbleStyles = [
    styles.bubble,
    isUser && message.image && !message.content
      ? (isDark ? styles.imageOnlyBubbleDark : styles.imageOnlyBubble)
      : null,
    isUser
      ? isDark
        ? styles.userBubbleDark
        : styles.userBubble
      : isDark
        ? styles.assistantBubbleDark
        : styles.assistantBubble,
    message.error && styles.errorBubble,
  ];

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
    >
      {/* Avatar for assistant */}
      {!isUser && (
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>D</Text>
          </View>
        </View>
      )}

      <View style={bubbleStyles}>
        {/* Optional image preview (for uploaded X-rays/photos) */}
        {message.image && (
          <View style={isUser ? styles.userImageWrapper : styles.imageWrapper}>
            <Image
              source={{ uri: message.image }}
              style={isUser ? styles.userImage : styles.image}
              resizeMode={isUser ? "contain" : "cover"}
            />
          </View>
        )}

        {parseContent(message.content, onCitationPress, isUser, isDark)}

        {/* Streaming cursor */}
        {isStreaming && (
          <View style={styles.cursor}>
            <View style={styles.cursorBar} />
          </View>
        )}

        {/* Error indicator */}
        {message.error && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={14} color={colors.error.main} />
            <Text style={styles.errorText}>Failed to send</Text>
          </View>
        )}
      </View>
    </View>
  );
});

export default MessageBubble;

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[3],
    paddingHorizontal: spacing[4],
    maxWidth: '100%',
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing[2],
  },
  avatarContainer: {
    marginTop: spacing[1],
  },
  avatar: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.primary[600],
  },
  bubble: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius['2xl'],
    borderBottomRightRadius: borderRadius.sm,
    maxWidth: '80%',
    ...shadows.sm,
  },
  assistantBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: borderRadius['2xl'],
    borderTopLeftRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    flex: 1,
    maxWidth: '85%',
    ...shadows.xs,
  },
  userBubbleDark: {
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius['2xl'],
    borderBottomRightRadius: borderRadius.sm,
    maxWidth: '80%',
    ...shadows.sm,
  },
  assistantBubbleDark: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderRadius: borderRadius['2xl'],
    borderTopLeftRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.5)',
    flex: 1,
    maxWidth: '85%',
    ...shadows.xs,
  },
  errorBubble: {
    backgroundColor: colors.error.light,
    borderColor: colors.error.main,
  },
  userText: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[0],
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
  },
  assistantText: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[800],
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
  },
  assistantTextDark: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[50],
    fontWeight: '600',
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
  },
  boldText: {
    fontWeight: '700',
    color: colors.neutral[900],
  },
  boldTextDark: {
    fontWeight: '800',
    color: colors.neutral[0],
  },
  italicText: {
    fontStyle: 'italic',
  },
  citationText: {
    color: colors.primary[600],
    fontWeight: '600',
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[1],
    borderRadius: borderRadius.xs,
    cursor: 'pointer',
  },
  citationTextDark: {
    color: colors.primary[200],
    fontWeight: '700',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: spacing[1],
    borderRadius: borderRadius.xs,
    cursor: 'pointer',
  },
  cursor: {
    marginLeft: spacing[1],
    marginTop: spacing[0.5],
  },
  cursorBar: {
    width: 2,
    height: typography.fontSize.base,
    backgroundColor: colors.primary[500],
  },
  imageWrapper: {
    marginBottom: spacing[3],
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  userImageWrapper: {
    marginBottom: spacing[0],
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    alignSelf: 'flex-end',
    width: scale(260),
    maxWidth: '100%',
  },
  image: {
    width: '100%',
    height: scale(220),
    backgroundColor: colors.neutral[900],
  },
  userImage: {
    width: '100%',
    height: scale(160),
    backgroundColor: colors.neutral[900],
  },
  imageOnlyBubble: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    ...shadows.xs,
  },
  imageOnlyBubbleDark: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    ...shadows.xs,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[2],
    gap: spacing[1],
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '500',
    color: colors.error.main,
  },
});






