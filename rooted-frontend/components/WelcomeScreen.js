/**
 * WelcomeScreen Component
 * Professional dental AI assistant welcome
 * Matches landing page glassy blue design system
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ChatInput from './ChatInput';
import { useThemeMode } from '../context/ThemeContext';
import designSystem from '../utils/designSystem';

const {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  isWeb,
} = designSystem;

const SUGGESTION_PROMPTS = [
  {
    icon: 'tooth',
    iconType: 'community',
    label: 'Root canal procedures',
    prompt: 'Explain the step-by-step procedure for root canal treatment',
  },
  {
    icon: 'bacteria',
    iconType: 'community',
    label: 'Periodontal disease',
    prompt: 'What are the stages of periodontal disease and their treatments?',
  },
  {
    icon: 'help-circle',
    iconType: 'community',
    label: 'MCQ practice',
    prompt: 'Give me 5 MCQs on dental anatomy',
  },
  {
    icon: 'clipboard-text',
    iconType: 'community',
    label: 'Case study',
    prompt: 'Present a clinical case of a patient with dental caries for diagnosis',
  },
];

export default function WelcomeScreen({
  userName = 'there',
  inputValue,
  onChangeText,
  onSend,
  isLoading,
}) {
  const { isDark } = useThemeMode();
  const handleSuggestionPress = (prompt) => {
    onChangeText(prompt);
    // Auto-send after short delay
    setTimeout(() => {
      onSend();
    }, 100);
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Background gradient - matching landing page */}
      <LinearGradient
        colors={
          isDark
            ? [colors.neutral[900], '#020617']
            : colors.gradients.background
        }
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Clean background - no decorative elements */}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Greeting */}
          <Text style={[styles.greeting, isDark && styles.greetingDark]}>Hi, Dr. {userName}</Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>Your AI dental assistant is ready</Text>

          {/* Input - glassy card style */}
          <View style={styles.inputWrapper}>
            <View style={[styles.inputCard, isDark && styles.inputCardDark]}>
              <ChatInput
                value={inputValue}
                onChangeText={onChangeText}
                onSend={onSend}
                isLoading={isLoading}
                placeholder="Ask about diagnosis, treatment, or procedures..."
              />
            </View>
          </View>

          {/* Quick suggestions - glassy chips */}
          <View style={styles.suggestionsContainer}>
            <Text style={[styles.suggestionsTitle, isDark && styles.suggestionsTitleDark]}>Try asking about:</Text>
            <View style={styles.suggestions}>
              {SUGGESTION_PROMPTS.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.suggestionChip, isDark && styles.suggestionChipDark]}
                  onPress={() => handleSuggestionPress(suggestion.prompt)}
                  activeOpacity={0.7}
                >
                  {suggestion.iconType === 'community' ? (
                    <MaterialCommunityIcons
                      name={suggestion.icon}
                      size={16}
                      color={colors.primary[400]}
                    />
                  ) : (
                    <MaterialIcons
                      name={suggestion.icon}
                      size={16}
                      color={colors.primary[400]}
                    />
                  )}
                  <Text style={[styles.suggestionText, isDark && styles.suggestionTextDark]}>{suggestion.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Disclaimer - fixed at bottom */}
      <View style={styles.disclaimerContainer}>
        <Text style={[styles.disclaimer, isDark && styles.disclaimerDark]}>
          RootED can make mistakes. Verify important information.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  containerDark: {
    backgroundColor: colors.neutral[900],
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  // Decorative circles removed for clean design
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[8],
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 600,
  },
  greeting: {
    fontSize: isWeb ? 36 : 28,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral[800],
    textAlign: 'center',
    marginBottom: spacing[2],
    letterSpacing: -0.5,
  },
  greetingDark: {
    color: colors.neutral[50],
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[500],
    textAlign: 'center',
    marginBottom: spacing[8],
  },
  subtitleDark: {
    color: colors.neutral[400],
  },
  inputWrapper: {
    width: '100%',
    marginBottom: spacing[8],
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing[1],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...Platform.select({
      web: {
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
      },
      default: {
        shadowColor: colors.neutral[900],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 3,
      },
    }),
  },
  inputCardDark: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderColor: 'rgba(148, 163, 184, 0.7)',
  },
  suggestionsContainer: {
    alignItems: 'center',
    width: '100%',
  },
  suggestionsTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[500],
    marginBottom: spacing[4],
  },
  suggestionsTitleDark: {
    color: colors.neutral[300],
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing[3],
    maxWidth: isWeb ? 550 : '100%',
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      },
      default: {
        shadowColor: colors.neutral[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 1,
      },
    }),
  },
  suggestionChipDark: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderColor: 'rgba(148, 163, 184, 0.7)',
  },
  suggestionText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[700],
  },
  suggestionTextDark: {
    color: colors.neutral[100],
  },
  disclaimerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    alignItems: 'center',
  },
  disclaimer: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[400],
    textAlign: 'center',
  },
  disclaimerDark: {
    color: colors.neutral[500],
  },
});
