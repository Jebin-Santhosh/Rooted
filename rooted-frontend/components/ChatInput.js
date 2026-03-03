/**
 * ChatInput Component
 * ChatGPT-style pill input with send button
 */

import React, { useState, useRef } from 'react';

import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Keyboard,
} from 'react-native';
import { Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import designSystem from '../utils/designSystem';
import { useThemeMode } from '../context/ThemeContext';


const {
  colors,
  spacing,
  typography,
  isWeb,
} = designSystem;

export default function ChatInput({
  value,
  onChangeText,
  onSend,
  onPickImage,
  isLoading = false,
  placeholder = 'Ask anything...',
  maxLength = 2000,
}) {

  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const { isDark } = useThemeMode();

  const canSend = value.trim().length > 0 && !isLoading;

  const handleSend = () => {
    if (!canSend) return;
    onSend();
    if (Platform.OS !== 'web') {
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = (e) => {
    if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };


  return (
    <View style={[
      styles.container,
      isFocused && styles.containerFocused,
      isDark && styles.containerDark,
    ]}>

      {/* PLUS BUTTON */}
      <TouchableOpacity
        style={styles.attachButton}
        onPress={() => setShowAttachmentMenu(prev => !prev)}
      >
        <MaterialIcons name="add" size={24} color={colors.neutral[500]} />
      </TouchableOpacity>

      {/* Attachment Popup */}
      {showAttachmentMenu && (
        <View style={styles.attachmentMenu}>
          <TouchableOpacity
            style={styles.attachmentOption}
            onPress={() => {
              setShowAttachmentMenu(false);
              onPickImage && onPickImage();
            }}
          >
            <MaterialIcons name="photo" size={18} color="#333" />
            <Text style={{ marginLeft: 8 }}>Add Photos</Text>
          </TouchableOpacity>
        </View>
      )}

      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.neutral[400]}
        multiline
        maxLength={maxLength}
        editable={!isLoading}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        textAlignVertical="center"
        returnKeyType="default"
        blurOnSubmit={false}
        onKeyPress={handleKeyPress}
      />

      <View style={styles.rightButtons}>
        <TouchableOpacity
          style={[
            styles.sendButton,
            canSend ? styles.sendButtonActive : styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name={isLoading ? 'hourglass-empty' : 'arrow-upward'}
            size={20}
            color={canSend ? colors.neutral[0] : colors.neutral[400]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    minHeight: 52,
    maxHeight: 200,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  containerFocused: {
    borderColor: colors.primary[300],
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
  },
  containerDark: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderColor: 'rgba(148, 163, 184, 0.6)',
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
    attachmentMenu: {
    position: 'absolute',
    bottom: 55,
    left: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    elevation: 6,
  },
  attachmentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2],
    fontSize: typography.fontSize.base,
    color: colors.neutral[50],
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    maxHeight: 150,
    ...(Platform.OS === 'web' && {
      outlineStyle: 'none',
    }),
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: colors.primary[500],
  },
  sendButtonDisabled: {
    backgroundColor: 'transparent',
  },
});
