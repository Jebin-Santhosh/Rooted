/**
 * Details Input Screen
 * Glassy Blue Design - Consistent colors - Centered for Web
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
  ScrollView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import designSystem from '../../utils/designSystem';
import { useOnboarding } from '../../context/OnboardingContext';

const { colors, typography, spacing, shadows, borderRadius, layout, isWeb } = designSystem;

// Generate years for students
const getYearOptions = (status) => {
  if (status === 'UG') {
    return [
      { id: '1', label: '1st Year' },
      { id: '2', label: '2nd Year' },
      { id: '3', label: '3rd Year' },
      { id: '4', label: '4th Year' },
      { id: '5', label: 'Intern' },
    ];
  }
  if (status === 'Masters') {
    return [
      { id: '1', label: '1st Year' },
      { id: '2', label: '2nd Year' },
      { id: '3', label: '3rd Year' },
    ];
  }
  return [];
};

// Experience ranges for practicing dentists
const EXPERIENCE_OPTIONS = [
  { id: '0-2', label: '0-2 years' },
  { id: '3-5', label: '3-5 years' },
  { id: '6-10', label: '6-10 years' },
  { id: '10+', label: '10+ years' },
];

const DetailsInputScreen = () => {
  const { userProfile, updateProfile, currentStep, totalSteps } = useOnboarding();
  const navigation = useNavigation();
  const isPracticing = userProfile.professionalStatus === 'Practicing';
  const isStudent = ['UG', 'Masters'].includes(userProfile.professionalStatus);

  const [selectedYear, setSelectedYear] = useState(userProfile.currentYear || '');
  const [selectedExperience, setSelectedExperience] = useState(userProfile.experienceYears || '');
  const [instituteName, setInstituteName] = useState(
    userProfile.instituteName || userProfile.clinicName || ''
  );
  const [errors, setErrors] = useState({});

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

  const yearOptions = getYearOptions(userProfile.professionalStatus);

  const getPlaceholderText = () => {
    if (isPracticing) return 'Enter clinic or hospital name';
    if (isStudent) return 'Enter your college/institute name';
    return 'Enter your institution name';
  };

  const getLabelText = () => {
    if (isPracticing) return 'Clinic / Hospital Name';
    return 'Institute / College Name';
  };

  const getIconName = () => {
    if (isPracticing) return 'hospital-building';
    return 'school';
  };

  const validateAndProceed = () => {
    const newErrors = {};

    if (isStudent && !selectedYear) {
      newErrors.year = 'Please select your current year';
    }

    if (isPracticing && !selectedExperience) {
      newErrors.experience = 'Please select your experience';
    }

    if (!instituteName.trim()) {
      newErrors.institute = isPracticing
        ? 'Please enter your clinic/hospital name'
        : 'Please enter your institute name';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const updates = {};

      if (isStudent) {
        updates.currentYear = selectedYear;
        updates.instituteName = instituteName.trim();
      } else if (isPracticing) {
        updates.experienceYears = selectedExperience;
        updates.clinicName = instituteName.trim();
      } else {
        updates.instituteName = instituteName.trim();
      }

      updateProfile(updates);
      navigation.navigate('Personalization');
    }
  };

  const handleBack = () => {
    navigation.navigate('ProfessionalStatus');
  };

  const isValid = () => {
    if (isStudent) {
      return selectedYear && instituteName.trim();
    }
    if (isPracticing) {
      return selectedExperience && instituteName.trim();
    }
    return instituteName.trim();
  };

  const progress = ((currentStep + 1) / totalSteps) * 100;

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
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Animated.View
                  style={[
                    styles.content,
                    {
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }],
                    },
                  ]}
                >
                  {/* Icon & Title */}
                  <View style={styles.iconContainer}>
                    <LinearGradient
                      colors={colors.gradients.primary}
                      style={styles.iconGradient}
                    >
                      <MaterialCommunityIcons
                        name={getIconName()}
                        size={32}
                        color={colors.neutral[0]}
                      />
                    </LinearGradient>
                  </View>

                  <Text style={styles.title}>
                    {isPracticing ? 'Your Practice Details' : 'Your Academic Details'}
                  </Text>
                  <Text style={styles.subtitle}>
                    Help us tailor content to your level
                  </Text>

                  {/* Year Selection (for students) */}
                  {isStudent && (
                    <View style={styles.section}>
                      <Text style={styles.sectionLabel}>Current Year</Text>
                      <View style={styles.chipContainer}>
                        {yearOptions.map((option) => {
                          const isSelected = selectedYear === option.id;
                          return (
                            <TouchableOpacity
                              key={option.id}
                              style={[
                                styles.chip,
                                isSelected && styles.chipSelected,
                              ]}
                              onPress={() => {
                                setSelectedYear(option.id);
                                if (errors.year) {
                                  setErrors((prev) => ({ ...prev, year: null }));
                                }
                              }}
                              activeOpacity={0.7}
                            >
                              <Text
                                style={[
                                  styles.chipText,
                                  isSelected && styles.chipTextSelected,
                                ]}
                              >
                                {option.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                      {errors.year && (
                        <Text style={styles.errorText}>{errors.year}</Text>
                      )}
                    </View>
                  )}

                  {/* Experience Selection (for practicing) */}
                  {isPracticing && (
                    <View style={styles.section}>
                      <Text style={styles.sectionLabel}>Years of Experience</Text>
                      <View style={styles.chipContainer}>
                        {EXPERIENCE_OPTIONS.map((option) => {
                          const isSelected = selectedExperience === option.id;
                          return (
                            <TouchableOpacity
                              key={option.id}
                              style={[
                                styles.chip,
                                isSelected && styles.chipSelected,
                              ]}
                              onPress={() => {
                                setSelectedExperience(option.id);
                                if (errors.experience) {
                                  setErrors((prev) => ({ ...prev, experience: null }));
                                }
                              }}
                              activeOpacity={0.7}
                            >
                              <Text
                                style={[
                                  styles.chipText,
                                  isSelected && styles.chipTextSelected,
                                ]}
                              >
                                {option.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                      {errors.experience && (
                        <Text style={styles.errorText}>{errors.experience}</Text>
                      )}
                    </View>
                  )}

                  {/* Institute/Clinic Name Input */}
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>{getLabelText()}</Text>
                    <TextInput
                      style={[
                        styles.input,
                        errors.institute && styles.inputError,
                      ]}
                      placeholder={getPlaceholderText()}
                      placeholderTextColor={colors.neutral[400]}
                      value={instituteName}
                      onChangeText={(text) => {
                        setInstituteName(text);
                        if (errors.institute) {
                          setErrors((prev) => ({ ...prev, institute: null }));
                        }
                      }}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                    {errors.institute && (
                      <Text style={styles.errorText}>{errors.institute}</Text>
                    )}
                  </View>
                </Animated.View>
              </ScrollView>

              {/* Continue Button */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[
                    styles.continueButton,
                    !isValid() && styles.buttonDisabled,
                  ]}
                  onPress={validateAndProceed}
                  disabled={!isValid()}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      isValid()
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

  // Decorative circles removed for clean design

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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.neutral[200],
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing[4],
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
    marginBottom: spacing[6],
  },

  // Sections
  section: {
    width: '100%',
    marginBottom: spacing[6],
  },
  sectionLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[700],
    marginBottom: spacing[3],
    marginLeft: spacing[1],
  },

  // Chips
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  chip: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
    borderRadius: borderRadius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    ...shadows.xs,
  },
  chipSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[400],
    ...shadows.sm,
  },
  chipText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[600],
  },
  chipTextSelected: {
    color: colors.primary[700],
    fontFamily: typography.fontFamily.semiBold,
  },

  // Input
  input: {
    backgroundColor: '#FFFFFF',
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
    marginTop: spacing[2],
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

export default DetailsInputScreen;
