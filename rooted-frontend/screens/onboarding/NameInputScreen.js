/**
 * Name Input Screen
 * Glassy Blue Design - Centered for Web
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import designSystem from '../../utils/designSystem';
import { useOnboarding } from '../../context/OnboardingContext';

const { height } = Dimensions.get('window');
const { colors, typography, spacing, shadows, borderRadius, layout, isWeb } = designSystem;

const NameInputScreen = () => {
  const { userProfile, updateProfile, currentStep, totalSteps } = useOnboarding();
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState(userProfile.firstName || '');
  const [lastName, setLastName] = useState(userProfile.lastName || '');
  const [errors, setErrors] = useState({});

  const lastNameRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateAndProceed = () => {
    const newErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = 'First name is too short';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (lastName.trim().length < 1) {
      newErrors.lastName = 'Last name is too short';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      navigation.navigate('ProfessionalStatus');
    }
  };

  const handleBack = () => {
    navigation.navigate('SignIn');
  };

  const isValid = firstName.trim().length >= 2 && lastName.trim().length >= 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.gradients.background}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative elements */}
      <View style={[styles.decorativeCircle, styles.circle1]} />
      <View style={[styles.decorativeCircle, styles.circle2]} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.centerWrapper}>
            <View style={styles.contentContainer}>
              {/* Header with progress */}
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBack}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="arrow-left"
                    size={24}
                    color={colors.neutral[700]}
                  />
                </TouchableOpacity>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                  </View>
                  <Text style={styles.progressText}>
                    Step {currentStep + 1} of {totalSteps}
                  </Text>
                </View>
              </View>

              {/* Content */}
              <Animated.View
                style={[
                  styles.content,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                {/* Icon */}
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={colors.gradients.primary}
                    style={styles.iconGradient}
                  >
                    <MaterialCommunityIcons
                      name="account"
                      size={32}
                      color={colors.neutral[0]}
                    />
                  </LinearGradient>
                </View>

                <Text style={styles.title}>What's your name?</Text>
                <Text style={styles.subtitle}>
                  Help us personalize your experience
                </Text>

                {/* Input Fields */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>First Name</Text>
                    <TextInput
                      style={[
                        styles.input,
                        errors.firstName && styles.inputError,
                      ]}
                      placeholder="Enter your first name"
                      placeholderTextColor={colors.neutral[400]}
                      value={firstName}
                      onChangeText={(text) => {
                        setFirstName(text);
                        if (errors.firstName) {
                          setErrors((prev) => ({ ...prev, firstName: null }));
                        }
                      }}
                      returnKeyType="next"
                      onSubmitEditing={() => lastNameRef.current?.focus()}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                    {errors.firstName && (
                      <Text style={styles.errorText}>{errors.firstName}</Text>
                    )}
                  </View>

                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Last Name</Text>
                    <TextInput
                      ref={lastNameRef}
                      style={[
                        styles.input,
                        errors.lastName && styles.inputError,
                      ]}
                      placeholder="Enter your last name"
                      placeholderTextColor={colors.neutral[400]}
                      value={lastName}
                      onChangeText={(text) => {
                        setLastName(text);
                        if (errors.lastName) {
                          setErrors((prev) => ({ ...prev, lastName: null }));
                        }
                      }}
                      returnKeyType="done"
                      onSubmitEditing={validateAndProceed}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                    {errors.lastName && (
                      <Text style={styles.errorText}>{errors.lastName}</Text>
                    )}
                  </View>
                </View>
              </Animated.View>

              {/* Continue Button */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[
                    styles.continueButton,
                    !isValid && styles.buttonDisabled,
                  ]}
                  onPress={validateAndProceed}
                  disabled={!isValid}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      isValid
                        ? colors.gradients.button
                        : [colors.neutral[300], colors.neutral[400]]
                    }
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.buttonText}>Continue</Text>
                    <MaterialCommunityIcons
                      name="arrow-right"
                      size={20}
                      color={colors.neutral[0]}
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  centerWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    maxWidth: isWeb ? layout.maxContentWidth : '100%',
  },

  // Decorative elements
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 999,
  },
  circle1: {
    width: 250,
    height: 250,
    backgroundColor: colors.primary[200],
    opacity: 0.4,
    top: -80,
    right: -80,
  },
  circle2: {
    width: 180,
    height: 180,
    backgroundColor: colors.secondary[200],
    opacity: 0.3,
    bottom: 150,
    left: -60,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    gap: spacing[4],
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.glass.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.glass.whiteSoft,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 3,
  },
  progressText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[500],
    marginTop: spacing[1],
    textAlign: 'right',
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[8],
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: spacing[6],
  },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.primary,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral[800],
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[500],
    textAlign: 'center',
    marginBottom: spacing[8],
  },

  // Input Fields
  inputContainer: {
    gap: spacing[5],
  },
  inputWrapper: {
    gap: spacing[2],
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[700],
    marginLeft: spacing[1],
  },
  input: {
    backgroundColor: colors.glass.card,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[800],
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  inputError: {
    borderColor: colors.error.main,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.error.main,
    marginLeft: spacing[1],
    marginTop: spacing[1],
  },

  // Footer
  footer: {
    paddingHorizontal: spacing[6],
    paddingBottom: Platform.OS === 'ios' ? spacing[2] : spacing[6],
    paddingTop: spacing[4],
  },
  continueButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.primary,
  },
  buttonDisabled: {
    ...shadows.none,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    gap: spacing[2],
  },
  buttonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.neutral[0],
  },
});

export default NameInputScreen;
