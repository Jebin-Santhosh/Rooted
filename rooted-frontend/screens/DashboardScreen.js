/**
 * DashboardScreen
 * RootED - Personalized learning dashboard
 * Uses user profile data from onboarding
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '../context/OnboardingContext';
import { getUserProgress } from '../config/firebase';
import designSystem from '../utils/designSystem';

const {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  isWeb,
} = designSystem;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Map usage goal IDs to display info
const GOAL_INFO = {
  exam_prep: {
    icon: 'school',
    title: 'Exam Preparation',
    description: 'Practice questions and study materials',
    color: colors.primary[500],
    action: 'Start Practice',
  },
  presentations: {
    icon: 'presentation',
    title: 'Presentations',
    description: 'Create slides and visual content',
    color: colors.secondary[500],
    action: 'Create New',
  },
  practice_knowledge: {
    icon: 'tooth',
    title: 'Clinical Knowledge',
    description: 'Quick reference guides',
    color: colors.success.main,
    action: 'Browse Topics',
  },
  research: {
    icon: 'magnify',
    title: 'Research',
    description: 'Deep dive into dental topics',
    color: colors.warning.main,
    action: 'Explore',
  },
  patient_education: {
    icon: 'account-heart',
    title: 'Patient Education',
    description: 'Explanatory content for patients',
    color: colors.info.main,
    action: 'View Materials',
  },
  case_studies: {
    icon: 'clipboard-text',
    title: 'Case Studies',
    description: 'Clinical case analysis',
    color: colors.error.main,
    action: 'Browse Cases',
  },
};

// Professional status display names
const PROFESSIONAL_STATUS = {
  BDS: 'BDS Student',
  MDS: 'MDS Student',
  UG: 'Undergraduate',
  Masters: 'Masters Student',
  Practicing: 'Practicing Dentist',
};

const GoalCard = ({ goal, onPress }) => {
  const info = GOAL_INFO[goal] || {
    icon: 'book-open-variant',
    title: goal,
    description: 'Learning resource',
    color: colors.neutral[500],
    action: 'Open',
  };

  return (
    <TouchableOpacity
      style={styles.goalCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.goalIconContainer, { backgroundColor: `${info.color}15` }]}>
        <MaterialCommunityIcons name={info.icon} size={24} color={info.color} />
      </View>
      <View style={styles.goalContent}>
        <Text style={styles.goalTitle}>{info.title}</Text>
        <Text style={styles.goalDescription}>{info.description}</Text>
      </View>
      <View style={[styles.goalActionBadge, { backgroundColor: info.color }]}>
        <Text style={styles.goalActionText}>{info.action}</Text>
        <MaterialIcons name="arrow-forward" size={14} color={colors.neutral[0]} />
      </View>
    </TouchableOpacity>
  );
};

const QuickStartCard = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity
    style={styles.quickStartCard}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <LinearGradient
      colors={colors.gradients.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.quickStartIcon}
    >
      <MaterialIcons name={icon} size={24} color={colors.neutral[0]} />
    </LinearGradient>
    <Text style={styles.quickStartTitle}>{title}</Text>
    <Text style={styles.quickStartSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

const LearningTip = ({ tip }) => (
  <View style={styles.tipCard}>
    <LinearGradient
      colors={colors.gradients.primarySoft}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.tipGradient}
    >
      <MaterialIcons name="lightbulb" size={24} color={colors.neutral[0]} />
      <View style={styles.tipContent}>
        <Text style={styles.tipTitle}>Learning Tip</Text>
        <Text style={styles.tipText}>{tip}</Text>
      </View>
    </LinearGradient>
  </View>
);

// Progress Stats Card
const ProgressCard = ({ icon, value, label, color }) => (
  <View style={styles.progressCard}>
    <View style={[styles.progressIcon, { backgroundColor: `${color}15` }]}>
      <MaterialCommunityIcons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.progressValue}>{value}</Text>
    <Text style={styles.progressLabel}>{label}</Text>
  </View>
);

export default function DashboardScreen({ onNavigate, onStartChat }) {
  const insets = useSafeAreaInsets();
  const { userProfile, firebaseUser } = useOnboarding();
  const [progress, setProgress] = useState(null);

  const userId = firebaseUser?.uid || userProfile?.uid;

  // Load user progress
  useEffect(() => {
    if (userId) {
      loadProgress();
    }
  }, [userId]);

  const loadProgress = async () => {
    try {
      const progressData = await getUserProgress(userId);
      setProgress(progressData);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  // Get personalized greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Get user's first name or fallback
  const getUserName = () => {
    return userProfile?.firstName || 'there';
  };

  // Get professional status display
  const getProfessionalStatus = () => {
    const status = userProfile?.professionalStatus;
    if (!status) return null;

    let display = PROFESSIONAL_STATUS[status] || status;

    // Add year info for students
    if (userProfile?.currentYear && ['BDS', 'MDS', 'UG', 'Masters'].includes(status)) {
      display += ` - Year ${userProfile.currentYear}`;
    }

    // Add experience for practicing dentists
    if (userProfile?.experienceYears && status === 'Practicing') {
      display += ` - ${userProfile.experienceYears} years`;
    }

    return display;
  };

  // Get user's learning goals
  const getUserGoals = () => {
    return userProfile?.usageGoals || [];
  };

  // Get institution/clinic name
  const getInstitution = () => {
    return userProfile?.instituteName || userProfile?.clinicName || null;
  };

  // Learning tips based on goals
  const getLearningTip = () => {
    const goals = getUserGoals();

    if (goals.includes('exam_prep')) {
      return "Try asking RootED to create practice MCQs from any topic. Spaced repetition helps with long-term retention!";
    }
    if (goals.includes('presentations')) {
      return "Ask RootED to help structure your presentation or generate key points on any dental topic.";
    }
    if (goals.includes('practice_knowledge')) {
      return "Use RootED as your quick reference guide. Ask about treatment protocols, drug dosages, or clinical guidelines.";
    }
    if (goals.includes('research')) {
      return "RootED can help summarize research papers and explain complex concepts. Try asking about recent advances in dentistry.";
    }
    return "Start a conversation with RootED to explore dental topics. The more specific your questions, the better the answers!";
  };

  const userGoals = getUserGoals();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing[4], paddingBottom: insets.bottom + spacing[6] }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>{getGreeting()}, {getUserName()}</Text>
            {getProfessionalStatus() && (
              <View style={styles.statusBadge}>
                <MaterialCommunityIcons name="school" size={14} color={colors.primary[600]} />
                <Text style={styles.statusText}>{getProfessionalStatus()}</Text>
              </View>
            )}
            {getInstitution() && (
              <Text style={styles.institutionText}>{getInstitution()}</Text>
            )}
          </View>
          {userProfile?.photoUrl ? (
            <Image
              source={{ uri: userProfile.photoUrl }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileInitials}>
                {(userProfile?.firstName?.[0] || 'U').toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Quick Start Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Start</Text>
          <View style={styles.quickStartGrid}>
            <QuickStartCard
              icon="chat"
              title="Ask RootED"
              subtitle="Start a conversation"
              onPress={() => onStartChat?.()}
            />
            <QuickStartCard
              icon="upload-file"
              title="Upload PDF"
              subtitle="Add study materials"
              onPress={() => onNavigate?.('upload')}
            />
          </View>
        </View>

        {/* Learning Progress */}
        {progress && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Progress</Text>
            <View style={styles.progressGrid}>
              <ProgressCard
                icon="fire"
                value={progress.learningStreak || 0}
                label="Day Streak"
                color={colors.warning.main}
              />
              <ProgressCard
                icon="chat-processing"
                value={progress.totalConversations || 0}
                label="Chats"
                color={colors.primary[500]}
              />
              <ProgressCard
                icon="message-text"
                value={progress.totalMessages || 0}
                label="Messages"
                color={colors.success.main}
              />
            </View>
          </View>
        )}

        {/* Your Learning Goals */}
        {userGoals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Learning Goals</Text>
              <Text style={styles.sectionSubtitle}>Based on your preferences</Text>
            </View>
            <View style={styles.goalsContainer}>
              {userGoals.map((goal) => (
                <GoalCard
                  key={goal}
                  goal={goal}
                  onPress={() => onStartChat?.()}
                />
              ))}
            </View>
          </View>
        )}

        {/* What You Can Do */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What RootED Can Help With</Text>
          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: colors.primary[50] }]}>
                <MaterialCommunityIcons name="brain" size={20} color={colors.primary[500]} />
              </View>
              <Text style={styles.featureText}>Answer Questions</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: colors.success.light }]}>
                <MaterialCommunityIcons name="file-document-edit" size={20} color={colors.success.main} />
              </View>
              <Text style={styles.featureText}>Generate MCQs</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: colors.warning.light }]}>
                <MaterialCommunityIcons name="text-box-search" size={20} color={colors.warning.main} />
              </View>
              <Text style={styles.featureText}>Summarize Content</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: colors.info.light }]}>
                <MaterialCommunityIcons name="lightbulb-on" size={20} color={colors.info.main} />
              </View>
              <Text style={styles.featureText}>Explain Concepts</Text>
            </View>
          </View>
        </View>

        {/* Learning Tip */}
        <LearningTip tip={getLearningTip()} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[5],
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[6],
  },
  headerContent: {
    flex: 1,
    marginRight: spacing[4],
  },
  greeting: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral[800],
    marginBottom: spacing[2],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    gap: spacing[1.5],
    marginBottom: spacing[1],
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary[700],
  },
  institutionText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[500],
    marginTop: spacing[1],
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.neutral[200],
  },
  profileImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral[0],
  },

  // Section
  section: {
    marginBottom: spacing[6],
  },
  sectionHeader: {
    marginBottom: spacing[3],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.neutral[800],
    marginBottom: spacing[1],
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[500],
  },

  // Progress Stats
  progressGrid: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  progressCard: {
    flex: 1,
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    alignItems: 'center',
    ...shadows.sm,
  },
  progressIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  progressValue: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral[800],
  },
  progressLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[500],
    marginTop: spacing[0.5],
  },

  // Quick Start
  quickStartGrid: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  quickStartCard: {
    flex: 1,
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    alignItems: 'center',
    ...shadows.sm,
  },
  quickStartIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  quickStartTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.neutral[800],
    marginBottom: spacing[1],
  },
  quickStartSubtitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[500],
    textAlign: 'center',
  },

  // Goals
  goalsContainer: {
    gap: spacing[3],
  },
  goalCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    ...shadows.sm,
  },
  goalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.neutral[800],
    marginBottom: spacing[0.5],
  },
  goalDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[500],
  },
  goalActionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    gap: spacing[1],
  },
  goalActionText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[0],
  },

  // Features Grid
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  featureItem: {
    width: (SCREEN_WIDTH - spacing[5] * 2 - spacing[3]) / 2,
    minWidth: isWeb ? 140 : undefined,
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    ...shadows.xs,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[700],
  },

  // Tip Card
  tipCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing[4],
    ...shadows.md,
  },
  tipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    gap: spacing[3],
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.neutral[0],
    marginBottom: spacing[1],
  },
  tipText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
});
