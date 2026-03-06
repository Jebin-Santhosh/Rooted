/**
 * Personalization Screen (Final Step)
 * Glassy Blue Design - Consistent colors - Centered for Web
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import designSystem from '../../utils/designSystem';
import { useOnboarding } from '../../context/OnboardingContext';

const { colors, typography, spacing, shadows, borderRadius, layout, isWeb } = designSystem;

const USAGE_GOALS = [
  {
    id: 'exam_prep',
    title: 'Exam Preparation',
    subtitle: 'Prepare for university exams and NEET MDS',
    icon: 'file-document-edit',
  },
  {
    id: 'presentations',
    title: 'Presentations & Seminars',
    subtitle: 'Create and prepare dental presentations',
    icon: 'presentation',
  },
  {
    id: 'practice_knowledge',
    title: 'Clinical Knowledge',
    subtitle: 'Quick reference for clinical practice',
    icon: 'tooth',
  },
  {
    id: 'research',
    title: 'Research & Learning',
    subtitle: 'Deep dive into dental topics',
    icon: 'magnify',
  },
  {
    id: 'patient_education',
    title: 'Patient Education',
    subtitle: 'Explain procedures to patients',
    icon: 'account-heart',
  },
  {
    id: 'case_studies',
    title: 'Case Studies',
    subtitle: 'Analyze and discuss clinical cases',
    icon: 'clipboard-text',
  },
];

const PersonalizationScreen = () => {
  const { userProfile, updateProfile, currentStep, totalSteps, completeOnboarding } = useOnboarding();
  const navigation = useNavigation();
  const [selectedGoals, setSelectedGoals] = useState(userProfile.usageGoals || []);
  const [isCompleting, setIsCompleting] = useState(false);

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

  const toggleGoal = (id) => {
    setSelectedGoals((prev) => {
      if (prev.includes(id)) {
        return prev.filter((g) => g !== id);
      }
      return [...prev, id];
    });
  };

  const handleBack = () => {
    navigation.navigate('Details');
  };

  const handleComplete = async () => {
    if (selectedGoals.length === 0) return;

    setIsCompleting(true);
    try {
      updateProfile({ usageGoals: selectedGoals });
      await completeOnboarding();
      // Navigate to dashboard and reset navigation stack
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        })
      );
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setIsCompleting(false);
    }
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
        <View style={styles.centerWrapper}>
          <View style={styles.contentContainer}>
            {/* Header with progress */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                activeOpacity={0.7}
                disabled={isCompleting}
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
                styles.contentWrapper,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Icon & Title */}
              <View style={styles.titleSection}>
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={colors.gradients.primary}
                    style={styles.iconGradient}
                  >
                    <MaterialCommunityIcons
                      name="tune"
                      size={32}
                      color={colors.neutral[0]}
                    />
                  </LinearGradient>
                </View>

                <Text style={styles.title}>How will you use RootED?</Text>
                <Text style={styles.subtitle}>
                  Select all that apply - we'll personalize your experience
                </Text>
              </View>

              {/* Goals Selection */}
              <ScrollView
                style={styles.goalsScroll}
                contentContainerStyle={styles.goalsContainer}
                showsVerticalScrollIndicator={false}
              >
                {USAGE_GOALS.map((goal) => {
                  const isSelected = selectedGoals.includes(goal.id);
                  return (
                    <TouchableOpacity
                      key={goal.id}
                      style={[
                        styles.goalCard,
                        isSelected && styles.goalCardSelected,
                      ]}
                      onPress={() => toggleGoal(goal.id)}
                      activeOpacity={0.7}
                      disabled={isCompleting}
                    >
                      <View
                        style={[
                          styles.goalIconContainer,
                          isSelected && styles.goalIconContainerSelected,
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={goal.icon}
                          size={24}
                          color={isSelected ? colors.primary[600] : colors.primary[500]}
                        />
                      </View>

                      <View style={styles.goalTextContainer}>
                        <Text style={[
                          styles.goalTitle,
                          isSelected && styles.goalTitleSelected,
                        ]}>
                          {goal.title}
                        </Text>
                        <Text style={styles.goalSubtitle}>{goal.subtitle}</Text>
                      </View>

                      <View
                        style={[
                          styles.checkbox,
                          isSelected && styles.checkboxSelected,
                        ]}
                      >
                        {isSelected && (
                          <MaterialCommunityIcons
                            name="check"
                            size={16}
                            color={colors.neutral[0]}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {/* Selected count indicator */}
                {selectedGoals.length > 0 && (
                  <View style={styles.selectionIndicator}>
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={18}
                      color={colors.primary[500]}
                    />
                    <Text style={styles.selectionText}>
                      {selectedGoals.length} goal{selectedGoals.length !== 1 ? 's' : ''} selected
                    </Text>
                  </View>
                )}
              </ScrollView>
            </Animated.View>

            {/* Complete Button */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.completeButton,
                  selectedGoals.length === 0 && styles.buttonDisabled,
                ]}
                onPress={handleComplete}
                disabled={selectedGoals.length === 0 || isCompleting}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    selectedGoals.length > 0
                      ? colors.gradients.button
                      : [colors.neutral[300], colors.neutral[400]]
                  }
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isCompleting ? (
                    <ActivityIndicator color={colors.neutral[0]} size="small" />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Get Started</Text>
                      <MaterialCommunityIcons
                        name="rocket-launch"
                        size={20}
                        color={colors.neutral[0]}
                      />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.skipText}>
                You can change these preferences later in settings
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
  contentWrapper: {
    flex: 1,
  },
  titleSection: {
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingTop: spacing[2],
    paddingBottom: spacing[4],
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
    fontSize: typography.fontSize['xl'],
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
  },

  // Goals
  goalsScroll: {
    flex: 1,
  },
  goalsContainer: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[4],
    gap: spacing[3],
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: spacing[4],
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.sm,
  },
  goalCardSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[400],
    ...shadows.glass,
  },
  goalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[4],
  },
  goalIconContainerSelected: {
    backgroundColor: colors.primary[100],
  },
  goalTextContainer: {
    flex: 1,
  },
  goalTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.neutral[800],
    marginBottom: 2,
  },
  goalTitleSelected: {
    color: colors.primary[700],
  },
  goalSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[500],
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },

  // Selection indicator
  selectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
  selectionText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary[600],
  },

  // Footer
  footer: {
    paddingHorizontal: spacing[6],
    paddingBottom: Platform.OS === 'ios' ? spacing[2] : spacing[6],
    paddingTop: spacing[3],
  },
  completeButton: {
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
  skipText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[400],
    textAlign: 'center',
    marginTop: spacing[3],
  },
});

export default PersonalizationScreen;
