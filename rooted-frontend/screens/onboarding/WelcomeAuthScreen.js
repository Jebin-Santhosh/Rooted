/**
 * RootED - Welcome & Google Auth Screen
 * Glassy Blue Design - Centered for Web
 * Firebase Google Authentication using signInWithPopup for web
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { signInWithGoogle, saveUserProfile, getUserProfile } from '../../config/firebase';
import designSystem from '../../utils/designSystem';
import { useOnboarding } from '../../context/OnboardingContext';
import RootedLogo from '../../components/RootedLogo';

const { height } = Dimensions.get('window');
const { colors, typography, spacing, shadows, borderRadius, layout, isWeb } = designSystem;

const WelcomeAuthScreen = () => {
  const { updateProfile } = useOnboarding();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use Firebase's signInWithPopup for web
      const user = await signInWithGoogle();

      if (user) {
        // Check if user has already completed onboarding
        const existingProfile = await getUserProfile(user.uid);

        if (existingProfile && existingProfile.onboardingComplete) {
          // Returning user - OnboardingContext will handle navigation via useEffect
          // Just update the profile and let the auto-redirect happen
          updateProfile({
            ...existingProfile,
            uid: user.uid,
          });
          // Navigation will be handled by App.js useEffect
          return;
        }

        // New user - proceed with onboarding
        const nameParts = (user.displayName || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Save basic user info to Firebase
        await saveUserProfile(user.uid, {
          email: user.email,
          firstName,
          lastName,
          photoUrl: user.photoURL || '',
          authProvider: 'google',
        });

        // Update local onboarding context
        updateProfile({
          uid: user.uid,
          firstName,
          lastName,
          email: user.email || '',
          photoUrl: user.photoURL || '',
        });

        // Navigate to name input screen (only for new users)
        navigation.navigate('NameInput');
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups for this site.');
      } else {
        setError('Sign-in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.gradients.background}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Clean background - no decorative elements */}

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerWrapper}>
          <View style={styles.content}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <RootedLogo size={120} showText={true} />
              </View>
              <Text style={styles.tagline}>Get to the root of it</Text>
            </View>

            {/* Feature Cards */}
            <View style={styles.featureSection}>
              <View style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <MaterialCommunityIcons
                    name="school"
                    size={24}
                    color={colors.primary[500]}
                  />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Smart Learning</Text>
                  <Text style={styles.featureDesc}>AI-powered study companion</Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <MaterialCommunityIcons
                    name="file-document-multiple"
                    size={24}
                    color={colors.primary[500]}
                  />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Exam Preparation</Text>
                  <Text style={styles.featureDesc}>Access comprehensive resources</Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <MaterialCommunityIcons
                    name="chart-line"
                    size={24}
                    color={colors.primary[500]}
                  />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Track Progress</Text>
                  <Text style={styles.featureDesc}>Monitor your learning journey</Text>
                </View>
              </View>
            </View>

            {/* Auth Section */}
            <View style={styles.authSection}>
              <Text style={styles.welcomeTitle}>Welcome!</Text>
              <Text style={styles.welcomeSubtitle}>
                Sign in to personalize your experience
              </Text>

              {error && (
                <View style={styles.errorContainer}>
                  <MaterialCommunityIcons
                    name="alert-circle"
                    size={18}
                    color={colors.error.main}
                  />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.googleButton, isLoading && styles.buttonDisabled]}
                onPress={handleGoogleSignIn}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.neutral[700]} size="small" />
                ) : (
                  <>
                    <Image
                      source={{ uri: 'https://www.google.com/favicon.ico' }}
                      style={styles.googleIcon}
                    />
                    <Text style={styles.googleButtonText}>Continue with Google</Text>
                  </>
                )}
              </TouchableOpacity>

              <Text style={styles.termsText}>
                By continuing, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
  centerWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: isWeb ? layout.maxContentWidth : '100%',
    paddingHorizontal: spacing[6],
    justifyContent: 'space-between',
    paddingVertical: spacing[8],
  },

  // Decorative circles removed for clean design

  // Logo Section
  logoSection: {
    alignItems: 'center',
    paddingTop: spacing[4],
  },
  logoContainer: {
    marginBottom: spacing[4],
  },
  tagline: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[500],
  },

  // Features Section
  featureSection: {
    paddingVertical: spacing[6],
    gap: spacing[3],
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[4],
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.neutral[800],
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[500],
  },

  // Auth Section
  authSection: {
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 0 : spacing[4],
  },
  welcomeTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral[800],
    marginBottom: spacing[2],
  },
  welcomeSubtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[500],
    marginBottom: spacing[6],
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error.light,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.sm,
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.error.dark,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[0],
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    width: '100%',
    maxWidth: 320,
    ...shadows.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: spacing[3],
  },
  googleButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.neutral[700],
  },
  termsText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[400],
    textAlign: 'center',
    marginTop: spacing[5],
    lineHeight: 18,
    paddingHorizontal: spacing[4],
  },
  termsLink: {
    color: colors.primary[600],
    fontFamily: typography.fontFamily.medium,
  },
});

export default WelcomeAuthScreen;
