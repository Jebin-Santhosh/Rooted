import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Base dimensions for responsive design
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = size => (width / guidelineBaseWidth) * size;
const verticalScale = size => (height / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

// Modern color palette
const colors = {
  primary: '#6366f1', // Indigo
  primaryDark: '#4f46e5',
  primaryLight: '#a5b4fc',
  secondary: '#ec4899', // Pink
  secondaryLight: '#f9a8d4',
  accent: '#06b6d4', // Cyan
  success: '#10b981', // Emerald
  warning: '#f59e0b', // Amber
  error: '#ef4444', // Red

  // Neutral colors
  background: '#ffffff',
  surface: '#f8fafc',
  surfaceVariant: '#f1f5f9',
  onSurface: '#1e293b',
  onSurfaceVariant: '#64748b',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',

  // Text colors
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textTertiary: '#94a3b8',

  // Gradients
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
};

export default StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header styles
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(16),
    paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(16),
    borderBottomLeftRadius: moderateScale(20),
    borderBottomRightRadius: moderateScale(20),
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: scale(4),
    },
    shadowOpacity: 0.1,
    shadowRadius: scale(8),
    elevation: 8,
  },
  headerTitle: {
    fontSize: moderateScale(28),
    fontWeight: '700',
    color: 'white',
    marginBottom: verticalScale(4),
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: moderateScale(14),
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: moderateScale(20),
    fontWeight: '500',
  },

  // Chat area styles
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    padding: scale(20),
    paddingBottom: verticalScale(100), // Extra space for input
  },

  // Message styles
  messageContainer: {
    marginBottom: verticalScale(20),
    maxWidth: width * 0.85,
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  assistantMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: moderateScale(16),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  userBubble: {
    backgroundColor: '#667eea',
    marginLeft: scale(40),
  },
  assistantBubble: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginRight: scale(40),
  },
  errorBubble: {
    borderColor: '#fee2e2',
    backgroundColor: '#fef2f2',
  },
  messageContent: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
  },
  userMessageText: {
    fontSize: moderateScale(15),
    color: 'white',
    lineHeight: moderateScale(22),
  },
  assistantMessageText: {
    fontSize: moderateScale(15),
    color: '#1e293b',
    lineHeight: moderateScale(22),
  },
  streamingIndicator: {
    color: '#667eea',
    fontSize: moderateScale(16),
    marginLeft: scale(4),
  },

  // Citation styles
  citationButton: {
    backgroundColor: '#eef2ff',
    borderRadius: moderateScale(4),
    paddingHorizontal: scale(4),
    paddingVertical: verticalScale(2),
    marginHorizontal: scale(2),
    alignSelf: 'flex-start',
  },
  citationText: {
    color: '#667eea',
    fontWeight: '600',
    fontSize: moderateScale(14),
  },

  // Error indicator
  errorIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(8),
  },
  errorText: {
    color: '#ef4444',
    fontSize: moderateScale(12),
    marginLeft: scale(4),
  },

  // Document badge styles
  documentBadgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: verticalScale(8),
    marginLeft: scale(4),
  },
  documentBadge: {
    backgroundColor: '#667eea',
    marginRight: scale(6),
    marginBottom: verticalScale(4),
  },
  documentBadgeText: {
    color: 'white',
    fontSize: moderateScale(11),
    fontWeight: '600',
  },

  // Reasoning card
  reasoningCard: {
    marginBottom: verticalScale(12),
    marginHorizontal: scale(4),
    backgroundColor: '#f8f9fa',
    borderLeftWidth: scale(3),
    borderLeftColor: '#667eea',
  },
  reasoningText: {
    color: '#6c757d',
    fontSize: moderateScale(11),
    fontStyle: 'italic',
    lineHeight: moderateScale(16),
  },

  // Input area styles
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(20),
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingBottom: Platform.OS === 'ios' ? verticalScale(30) : verticalScale(20),
  },
  textInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: moderateScale(28),
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(12),
    fontSize: moderateScale(15),
    maxHeight: verticalScale(100),
    minHeight: verticalScale(48),
    backgroundColor: 'white',
    marginRight: scale(12),
    textAlignVertical: 'top',
  },
  textInputFocused: {
    borderColor: '#667eea',
  },
  sendButton: {
    width: scale(48),
    height: scale(48),
    borderRadius: moderateScale(24),
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
    elevation: 0,
  },

  // Welcome message styles
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(100),
    paddingHorizontal: scale(40),
  },
  welcomeTitle: {
    fontSize: moderateScale(28),
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: moderateScale(16),
    color: '#64748b',
    marginBottom: verticalScale(32),
    textAlign: 'center',
  },
  featuresList: {
    alignSelf: 'stretch',
    marginBottom: verticalScale(40),
  },
  featureItem: {
    fontSize: moderateScale(14),
    color: '#475569',
    lineHeight: moderateScale(24),
    marginBottom: verticalScale(8),
    textAlign: 'left',
  },
  welcomePrompt: {
    fontSize: moderateScale(16),
    color: '#64748b',
    textAlign: 'center',
    marginTop: verticalScale(20),
  },

  // MCQ Styles
  mcqContainer: {
    maxHeight: verticalScale(400),
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    marginHorizontal: scale(20),
    marginBottom: verticalScale(20),
    borderRadius: moderateScale(12),
    padding: scale(20),
  },
  mcqHeader: {
    backgroundColor: '#667eea',
    marginBottom: verticalScale(16),
    borderRadius: moderateScale(12),
  },
  mcqHeaderTitle: {
    color: 'white',
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mcqQuestionCard: {
    marginBottom: verticalScale(16),
    backgroundColor: 'white',
    borderRadius: moderateScale(8),
    elevation: 1,
  },
  mcqQuestionText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: moderateScale(24),
    marginBottom: verticalScale(12),
  },
  mcqOptionsContainer: {
    gap: verticalScale(8),
  },
  mcqOption: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderWidth: 2,
    borderRadius: moderateScale(8),
    backgroundColor: 'white',
  },
  mcqOptionDefault: {
    borderColor: '#e2e8f0',
  },
  mcqOptionSelected: {
    borderColor: '#667eea',
    backgroundColor: '#eef2ff',
  },
  mcqOptionCorrect: {
    borderColor: '#10b981',
    backgroundColor: '#d1fae5',
  },
  mcqOptionIncorrect: {
    borderColor: '#ef4444',
    backgroundColor: '#fee2e2',
  },
  mcqOptionDisabled: {
    borderColor: '#e2e8f0',
    backgroundColor: '#f8f9fa',
    opacity: 0.7,
  },
  mcqOptionText: {
    fontSize: moderateScale(14),
    color: '#374151',
  },
  mcqOptionTextSelected: {
    fontWeight: '600',
  },
  mcqExplanationCard: {
    marginTop: verticalScale(12),
    backgroundColor: '#f8f9fa',
    borderLeftWidth: scale(4),
    borderLeftColor: '#667eea',
  },
  mcqExplanationTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: verticalScale(4),
  },
  mcqExplanationText: {
    fontSize: moderateScale(14),
    color: '#475569',
    lineHeight: moderateScale(20),
  },
  mcqSubmitButton: {
    marginTop: verticalScale(16),
    backgroundColor: '#667eea',
  },
  mcqScoreCard: {
    backgroundColor: '#667eea',
    marginBottom: verticalScale(16),
    borderRadius: moderateScale(12),
  },
  mcqScoreContent: {
    alignItems: 'center',
    paddingVertical: verticalScale(20),
  },
  mcqScoreTitle: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: 'white',
    marginTop: verticalScale(8),
  },
  mcqScorePercentage: {
    fontSize: moderateScale(32),
    fontWeight: 'bold',
    color: 'white',
    marginTop: verticalScale(4),
  },
  mcqScoreMessage: {
    fontSize: moderateScale(16),
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: verticalScale(8),
  },
});
