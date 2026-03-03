/**
 * Professional Status Screen
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import designSystem from '../../utils/designSystem';
import { useOnboarding } from '../../context/OnboardingContext';

const { colors, typography, spacing, shadows, borderRadius, layout, isWeb } = designSystem;

const PROFESSIONAL_OPTIONS = [
  {
    id: 'UG',
    title: 'Undergraduate (UG)',
    subtitle: 'Currently pursuing BDS',
    icon: 'school',
  },
  {
    id: 'BDS',
    title: 'BDS Graduate',
    subtitle: 'Completed Bachelor of Dental Surgery',
    icon: 'school-outline',
  },
  {
    id: 'Masters',
    title: 'Postgraduate (PG)',
    subtitle: 'Currently pursuing MDS',
    icon: 'book-education',
  },
  {
    id: 'MDS',
    title: 'MDS Graduate',
    subtitle: 'Completed Master of Dental Surgery',
    icon: 'certificate',
  },
  {
    id: 'Practicing',
    title: 'Practicing Dentist',
    subtitle: 'Currently working in clinic/hospital',
    icon: 'tooth',
  },
];

const ProfessionalStatusScreen = () => {
  const { userProfile, updateProfile, currentStep, totalSteps } = useOnboarding();
  const navigation = useNavigation();
  const [selected, setSelected] = useState(userProfile.professionalStatus || '');

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

  const handleSelect = (id) => {
    setSelected(id);
  };

  const handleContinue = () => {
    if (selected) {
      updateProfile({ professionalStatus: selected });
      navigation.navigate('Details');
    }
  };

  const handleBack = () => {
    navigation.navigate('NameInput');
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

      {/* Decorative elements */}
      <View style={[styles.decorativeCircle, styles.circle1]} />
      <View style={[styles.decorativeCircle, styles.circle2]} />

      <SafeAreaView style={styles.safeArea}>
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
                      name="stethoscope"
                      size={32}
                      color={colors.neutral[0]}
                    />
                  </LinearGradient>
                </View>

                <Text style={styles.title}>Your Professional Status</Text>
                <Text style={styles.subtitle}>
                  Select your current stage in dentistry
                </Text>
              </View>

              {/* Options */}
              <ScrollView
                style={styles.optionsScroll}
                contentContainerStyle={styles.optionsContainer}
                showsVerticalScrollIndicator={false}
              >
                {PROFESSIONAL_OPTIONS.map((option) => {
                  const isSelected = selected === option.id;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionCard,
                        isSelected && styles.optionCardSelected,
                      ]}
                      onPress={() => handleSelect(option.id)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.optionIconContainer,
                          isSelected && styles.optionIconContainerSelected,
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={option.icon}
                          size={24}
                          color={isSelected ? colors.primary[600] : colors.primary[500]}
                        />
                      </View>

                      <View style={styles.optionTextContainer}>
                        <Text style={[
                          styles.optionTitle,
                          isSelected && styles.optionTitleSelected,
                        ]}>
                          {option.title}
                        </Text>
                        <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                      </View>

                      <View
                        style={[
                          styles.radioOuter,
                          isSelected && styles.radioOuterSelected,
                        ]}
                      >
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </Animated.View>

            {/* Continue Button */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  !selected && styles.buttonDisabled,
                ]}
                onPress={handleContinue}
                disabled={!selected}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    selected
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
    bottom: 100,
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
  contentWrapper: {
    flex: 1,
  },
  titleSection: {
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[6],
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
  },

  // Options
  optionsScroll: {
    flex: 1,
  },
  optionsContainer: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[4],
    gap: spacing[3],
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass.card,
    padding: spacing[4],
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.sm,
  },
  optionCardSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[400],
    ...shadows.glass,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[4],
  },
  optionIconContainerSelected: {
    backgroundColor: colors.primary[100],
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.neutral[800],
    marginBottom: 2,
  },
  optionTitleSelected: {
    color: colors.primary[700],
  },
  optionSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[500],
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary[500],
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary[500],
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

export default ProfessionalStatusScreen;
