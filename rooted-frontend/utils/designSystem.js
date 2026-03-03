/**
 * RootED Design System
 * Glassy Blue Theme - Modern Healthcare Aesthetic
 * Inspired by Mind Bridge design
 */

import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base scale for responsive design
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// For web, cap the scaling to prevent oversized UI
const isWeb = Platform.OS === 'web';
const maxWebWidth = 500;

const effectiveWidth = isWeb ? Math.min(SCREEN_WIDTH, maxWebWidth) : SCREEN_WIDTH;

// Responsive scaling functions
export const scale = (size) => {
  if (isWeb) return size;
  return (effectiveWidth / BASE_WIDTH) * size;
};

export const verticalScale = (size) => {
  if (isWeb) return size;
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

export const moderateScale = (size, factor = 0.5) => {
  if (isWeb) return size;
  return size + (scale(size) - size) * factor;
};

export const scaledFontSize = (size) => {
  if (isWeb) return size;
  const newSize = moderateScale(size);
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// ============================================
// COLOR PALETTE - Glassy Blue Theme
// ============================================
export const colors = {
  // Primary - Soft Blue (main accent)
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Secondary - Sky/Cyan for accents
  secondary: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
  },

  // Neutral - Slate grays for text and backgrounds
  neutral: {
    0: '#FFFFFF',
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  // Glass effects
  glass: {
    white: 'rgba(255, 255, 255, 0.85)',
    whiteSoft: 'rgba(255, 255, 255, 0.6)',
    whiteLight: 'rgba(255, 255, 255, 0.4)',
    blueTint: 'rgba(219, 234, 254, 0.5)',
    card: 'rgba(255, 255, 255, 0.9)',
    cardHover: 'rgba(255, 255, 255, 0.95)',
  },

  // Semantic colors - keeping blue theme
  success: {
    light: '#DCFCE7',
    main: '#22C55E',
    dark: '#16A34A',
  },
  warning: {
    light: '#FEF3C7',
    main: '#F59E0B',
    dark: '#D97706',
  },
  error: {
    light: '#FEE2E2',
    main: '#EF4444',
    dark: '#DC2626',
  },
  info: {
    light: '#DBEAFE',
    main: '#3B82F6',
    dark: '#2563EB',
  },

  // Background gradients - Glassy blue theme
  gradients: {
    // Main background gradient
    background: ['#E0F2FE', '#BAE6FD', '#E0E7FF'],
    backgroundAlt: ['#DBEAFE', '#BFDBFE', '#E0F2FE'],
    // Card/surface gradients
    surface: ['#FFFFFF', '#F8FAFC'],
    // Accent gradients
    primary: ['#3B82F6', '#2563EB'],
    primarySoft: ['#60A5FA', '#3B82F6'],
    // Button gradients
    button: ['#3B82F6', '#1D4ED8'],
    buttonSoft: ['#60A5FA', '#3B82F6'],
  },
};

// ============================================
// TYPOGRAPHY
// ============================================
export const typography = {
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    fallback: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
  },

  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
  },
};

// ============================================
// SPACING
// ============================================
export const spacing = {
  0: 0,
  px: 1,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
};

// ============================================
// BORDER RADIUS - Rounded modern look
// ============================================
export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

// ============================================
// SHADOWS - Soft, glassy shadows
// ============================================
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  // Glass card shadow
  glass: {
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  // Colored shadows
  primary: {
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
};

// ============================================
// BREAKPOINTS
// ============================================
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export const isSmallScreen = SCREEN_WIDTH < breakpoints.sm;
export const isMediumScreen = SCREEN_WIDTH >= breakpoints.sm && SCREEN_WIDTH < breakpoints.md;
export const isLargeScreen = SCREEN_WIDTH >= breakpoints.md;

// ============================================
// LAYOUT CONSTANTS
// ============================================
export const layout = {
  // Max width for centered content on web
  maxContentWidth: 480,
  maxCardWidth: 420,
  // Onboarding specific
  onboarding: {
    maxWidth: isWeb ? 480 : '100%',
    containerPadding: isWeb ? spacing[8] : spacing[6],
  },
};

// ============================================
// COMPONENT TOKENS
// ============================================
export const components = {
  chatMaxWidth: isWeb ? 800 : '100%',

  // Glass card style
  glassCard: {
    backgroundColor: colors.glass.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    ...shadows.glass,
  },

  // Input field
  input: {
    backgroundColor: colors.glass.card,
    borderColor: colors.neutral[200],
    borderColorFocus: colors.primary[400],
    textColor: colors.neutral[800],
    placeholderColor: colors.neutral[400],
    borderRadius: borderRadius.lg,
    height: 52,
    padding: {
      horizontal: spacing[5],
      vertical: spacing[4],
    },
  },

  // Primary button
  button: {
    height: 52,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[6],
  },

  // Selection card
  selectionCard: {
    backgroundColor: colors.glass.card,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    borderWidth: 2,
    borderColor: 'transparent',
    selectedBorderColor: colors.primary[400],
    selectedBackground: colors.primary[50],
  },
};

// ============================================
// THEME OBJECT
// ============================================
const designSystem = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
  components,
  layout,
  scale,
  verticalScale,
  moderateScale,
  scaledFontSize,
  isSmallScreen,
  isMediumScreen,
  isLargeScreen,
  isWeb,
};

export default designSystem;
