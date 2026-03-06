/**
 * RootED - Your AI Dental Study Companion
 * Get to the root of dental knowledge
 * Modern React Native app with glassy blue design
 */

import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, LogBox, View, Text, ActivityIndicator, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';
import * as Linking from 'expo-linking';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import MainLayout from './screens/MainLayout';
import PDFViewerScreen from './screens/PDFViewerScreen';
import LandingPage from './screens/LandingPage';
import WelcomeAuthScreen from './screens/onboarding/WelcomeAuthScreen';
import NameInputScreen from './screens/onboarding/NameInputScreen';
import ProfessionalStatusScreen from './screens/onboarding/ProfessionalStatusScreen';
import DetailsInputScreen from './screens/onboarding/DetailsInputScreen';
import PersonalizationScreen from './screens/onboarding/PersonalizationScreen';
import { OnboardingProvider, useOnboarding } from './context/OnboardingContext';
import { ThemeProvider, useThemeMode } from './context/ThemeContext';
import designSystem from './utils/designSystem';

const { colors } = designSystem;

// Suppress specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

// Set document title for web
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  document.title = 'RootED - Dental Assistant';
}

const Stack = createNativeStackNavigator();

// URL prefix for deep linking
const prefix = Linking.createURL('/');

// Linking configuration for URL routing
const linking = {
  prefixes: [prefix, 'http://localhost:8081', 'https://rooted.app'],
  config: {
    screens: {
      Landing: '',
      SignIn: 'signin',
      Onboarding: 'onboarding',
      NameInput: 'onboarding/name',
      ProfessionalStatus: 'onboarding/status',
      Details: 'onboarding/details',
      Personalization: 'onboarding/goals',
      Dashboard: 'dashboard',
      PDFViewer: 'pdf/:id',
    },
  },
};

// Custom Paper themes with design system colors
const customLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary[500],
    secondary: colors.secondary[500],
    tertiary: colors.primary[300],
    surface: colors.neutral[0],
    surfaceVariant: colors.neutral[50],
    background: colors.neutral[50],
    error: colors.error.main,
    onPrimary: colors.neutral[0],
    onSecondary: colors.neutral[0],
    onSurface: colors.neutral[800],
    onSurfaceVariant: colors.neutral[600],
    outline: colors.neutral[300],
    outlineVariant: colors.neutral[200],
  },
  roundness: 16,
};

const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary[400],
    secondary: colors.secondary[400],
    tertiary: colors.primary[200],
    background: colors.neutral[900],
    surface: 'rgba(15, 23, 42, 0.96)',
    surfaceVariant: 'rgba(15, 23, 42, 0.9)',
    error: colors.error.main,
    onPrimary: colors.neutral[0],
    onSecondary: colors.neutral[0],
    onSurface: colors.neutral[50],
    onSurfaceVariant: colors.neutral[200],
    outline: colors.neutral[600],
    outlineVariant: colors.neutral[700],
  },
  roundness: 16,
};

// Loading screen component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <View style={styles.loadingLogo}>
      <Text style={styles.loadingLogoText}>R</Text>
    </View>
    <ActivityIndicator size="large" color={colors.primary[500]} style={styles.spinner} />
    <Text style={styles.loadingText}>Loading RootED...</Text>
  </View>
);

// Main App Content - handles authentication and onboarding state
const AppContent = ({ fontsLoaded }) => {
  const { isAuthenticated, isOnboardingComplete, isLoading } = useOnboarding();
  const navigationRef = useRef(null);
  const { isDark } = useThemeMode();

  // Determine initial route based on auth state
  const getInitialRoute = () => {
    if (isAuthenticated && isOnboardingComplete) {
      return 'Dashboard';
    }
    return 'Landing';
  };

  // Auto-navigate when auth/onboarding state changes (for returning users)
  useEffect(() => {
    if (!isLoading && navigationRef.current) {
      if (isAuthenticated && isOnboardingComplete) {
        // User is fully authenticated and onboarded - go to dashboard
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
      }
    }
  }, [isAuthenticated, isOnboardingComplete, isLoading]);

  if (!fontsLoaded || isLoading) {
    return <LoadingScreen />;
  }

  const navigationTheme = {
    dark: isDark,
    colors: {
      primary: colors.primary[500],
      background: isDark ? colors.neutral[900] : colors.neutral[50],
      card: isDark ? 'rgba(15,23,42,0.96)' : colors.neutral[0],
      text: isDark ? colors.neutral[50] : colors.neutral[800],
      border: isDark ? colors.neutral[700] : colors.neutral[200],
      notification: colors.error.main,
    },
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navigationTheme}
      linking={linking}
      fallback={<LoadingScreen />}
      onStateChange={(state) => {
        // Update URL on web
        if (Platform.OS === 'web' && state) {
          const route = state.routes[state.index];
          const path = linking.config.screens[route.name];
          if (path !== undefined) {
            window.history.replaceState({}, '', `/${path}`);
          }
        }
      }}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator
        initialRouteName={getInitialRoute()}
        screenOptions={{
          headerShown: false,
          animation: Platform.OS === 'web' ? 'none' : 'slide_from_right',
          contentStyle: { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] },
        }}
      >
        {/* Public Routes */}
        <Stack.Screen
          name="Landing"
          component={LandingPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignIn"
          component={WelcomeAuthScreen}
          options={{ headerShown: false }}
        />

        {/* Onboarding Routes */}
        <Stack.Screen
          name="NameInput"
          component={NameInputScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProfessionalStatus"
          component={ProfessionalStatusScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Details"
          component={DetailsInputScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Personalization"
          component={PersonalizationScreen}
          options={{ headerShown: false }}
        />

        {/* Protected Routes - Main App */}
        <Stack.Screen
          name="Dashboard"
          component={MainLayout}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PDFViewer"
          component={PDFViewerScreen}
          options={({ route }) => ({
            headerShown: true,
            title: route.params?.title || 'Document',
            headerStyle: {
              backgroundColor: colors.primary[500],
            },
            headerTintColor: colors.neutral[0],
            headerTitleStyle: {
              fontFamily: 'Inter_600SemiBold',
              fontSize: 18,
            },
            animation: Platform.OS === 'web' ? 'none' : 'slide_from_bottom',
            presentation: Platform.OS === 'web' ? 'card' : 'modal',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Error Boundary for catching runtime errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#EF4444', marginBottom: 16 }}>Something went wrong</Text>
          <Text style={{ fontSize: 14, color: '#333', textAlign: 'center' }}>{this.state.error?.message || 'Unknown error'}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          Inter_400Regular,
          Inter_500Medium,
          Inter_600SemiBold,
          Inter_700Bold,
        });
        setFontsLoaded(true);
      } catch (e) {
        console.warn('Font loading error:', e);
        // Still allow app to run without custom fonts
        setFontsLoaded(true);
      }
    }

    loadFonts();
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        {/* Global glassy gradient background */}
        <LinearGradient
          colors={colors.gradients.background}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <SafeAreaProvider>
          <ThemeProvider>
            <ThemedRoot fontsLoaded={fontsLoaded} />
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

function ThemedRoot({ fontsLoaded }) {
  const { mode } = useThemeMode();
  const paperTheme = mode === 'dark' ? customDarkTheme : customLightTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <OnboardingProvider>
        <AppContent fontsLoaded={fontsLoaded} />
      </OnboardingProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[900],
  },
  loadingLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingLogoText: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.neutral[0],
  },
  spinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.neutral[400],
  },
});

