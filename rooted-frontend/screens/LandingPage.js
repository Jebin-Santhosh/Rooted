/**
 * RootED Landing Page
 * Premium design inspired by mecha-health.ai
 * Professional, polished, and consistent
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Animated,
  useWindowDimensions,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import designSystem from '../utils/designSystem';
import RootedLogo from '../components/RootedLogo';
import { useThemeMode } from '../context/ThemeContext';

const {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
} = designSystem;

const isWeb = Platform.OS === 'web';

// Smooth fade in animation
const FadeIn = ({ children, delay = 0, style }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity: fadeAnim, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
};

// Premium Feature Card with hover effect
const FeatureCard = ({ icon, iconType, title, description, index, cardWidth }) => {
  const [isHovered, setIsHovered] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: 100 + index * 80,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay: 100 + index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const renderIcon = () => {
    const iconProps = { size: 28, color: colors.primary[500] };
    switch (iconType) {
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons name={icon} {...iconProps} />;
      case 'Ionicons':
        return <Ionicons name={icon} {...iconProps} />;
      case 'Feather':
        return <Feather name={icon} {...iconProps} />;
      default:
        return null;
    }
  };

  return (
    <Animated.View
      style={[
        styles.featureCardWrapper,
        { width: cardWidth, opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.95}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={[
          styles.featureCard,
          isHovered && styles.featureCardHovered,
        ]}
      >
        <View style={styles.featureIconWrapper}>
          <View style={styles.featureIconBg}>
            {renderIcon()}
          </View>
        </View>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Stat Card Component
const StatCard = ({ value, label, index }) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: 200 + index * 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay: 200 + index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.statCard, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};

const LandingPage = () => {
  const { width, height } = useWindowDimensions();
  const navigation = useNavigation();
  const scrollRef = useRef(null);
  const { isDark, toggleTheme } = useThemeMode();

  // Responsive breakpoints
  const isLargeScreen = width > 1024;
  const isMediumScreen = width > 768;
  const isSmallScreen = width <= 768;

  // Calculate card width for consistent sizing
  const getCardWidth = () => {
    if (isLargeScreen) return 280;
    if (isMediumScreen) return 260;
    return width - 48; // Full width minus padding on small screens
  };

  // Navigate to sign in page
  const handleGetStarted = () => navigation.navigate('SignIn');
  const handleLogin = () => navigation.navigate('SignIn');

  // Track scroll positions
  const contentRef = useRef(null);
  const featuresRef = useRef(null);
  const storyRef = useRef(null);
  const aboutRef = useRef(null);

  const scrollToSection = (section) => {
    let targetRef = null;
    if (section === 'features') targetRef = featuresRef;
    else if (section === 'story') targetRef = storyRef;
    else if (section === 'about') targetRef = aboutRef;

    if (targetRef?.current && contentRef.current) {
      targetRef.current.measureLayout(
        contentRef.current,
        (x, y) => {
          scrollRef.current?.scrollTo({ y: y - 80, animated: true });
        },
        () => console.log('measureLayout failed')
      );
    }
  };

  const features = [
    {
      icon: 'brain',
      iconType: 'MaterialCommunityIcons',
      title: 'AI-Powered Learning',
      description: 'Get instant, accurate answers to any dental question with our advanced AI.',
    },
    {
      icon: 'library',
      iconType: 'Ionicons',
      title: 'Study Resources',
      description: 'Access comprehensive materials covering all dental subjects and topics.',
    },
    {
      icon: 'check-circle',
      iconType: 'Feather',
      title: 'MCQ Practice',
      description: 'Prepare for NEET MDS, AIIMS, and other competitive dental exams.',
    },
    {
      icon: 'trending-up',
      iconType: 'Feather',
      title: 'Track Progress',
      description: 'Monitor your learning journey with detailed analytics and insights.',
    },
  ];

  const stats = [
    { value: '1000+', label: 'Practice Questions' },
    { value: '24/7', label: 'AI Assistance' },
    { value: 'All', label: 'Dental Subjects' },
  ];

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Background gradient - same as sign-in page */}
      <LinearGradient
        colors={isDark ? [colors.neutral[900], '#020617'] : colors.gradients.background}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative circles - blue theme */}
      <View style={[styles.decorativeCircle, styles.circle1, isDark && styles.circleDark]} />
      <View style={[styles.decorativeCircle, styles.circle2, isDark && styles.circleDark]} />
      <View style={[styles.decorativeCircle, styles.circle3, isDark && styles.circleDark]} />
      <View style={[styles.decorativeCircle, styles.circle4, isDark && styles.circleDark]} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerInner}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
            >
              <RootedLogo size={isSmallScreen ? 60 : 80} showText={true} />
            </TouchableOpacity>

            <View style={styles.headerNav}>
              {isWeb && isMediumScreen && (
                <View style={styles.navLinks}>
                  <TouchableOpacity style={styles.navLink} onPress={() => scrollToSection('features')}>
                    <Text style={styles.navLinkText}>Features</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.navLink} onPress={() => scrollToSection('story')}>
                    <Text style={styles.navLinkText}>Story</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.navLink} onPress={() => scrollToSection('about')}>
                    <Text style={styles.navLinkText}>About</Text>
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
                <Text style={styles.loginBtnText}>Log in</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ctaBtn} onPress={handleGetStarted}>
                <LinearGradient
                  colors={[colors.primary[400], colors.primary[500]]}
                  style={styles.ctaBtnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.ctaBtnText}>Get Started</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.themeToggle}
                onPress={toggleTheme}
                activeOpacity={0.8}
              >
                <Feather
                  name={isDark ? 'sun' : 'moon'}
                  size={18}
                  color={isDark ? colors.neutral[100] : colors.neutral[700]}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View ref={contentRef} collapsable={false}>
          {/* Hero Section */}
          <View style={styles.heroGradient}>
            <View style={[styles.heroSection, { minHeight: height * 0.75 }]}>
              <View style={[styles.heroContent, { maxWidth: isLargeScreen ? 700 : '100%' }]}>
                <FadeIn delay={0}>
                  <View style={styles.heroBadge}>
                    <View style={styles.heroBadgeDot} />
                    <Text style={styles.heroBadgeText}>AI-Powered Dental Education</Text>
                  </View>
                </FadeIn>

                <FadeIn delay={100}>
                  <Text style={[styles.heroTitle, { fontSize: isLargeScreen ? 56 : isMediumScreen ? 44 : 34 }]}>
                    Get to the{' '}
                    <Text style={styles.heroTitleAccent}>Root</Text>
                    {'\n'}of Dental Knowledge
                  </Text>
                </FadeIn>

                <FadeIn delay={200}>
                  <Text style={[styles.heroSubtitle, { fontSize: isLargeScreen ? 20 : 17 }]}>
                    Your intelligent study companion for mastering dentistry. From BDS to MDS, learn smarter with AI-powered guidance.
                  </Text>
                </FadeIn>

                <FadeIn delay={300}>
                  <View style={styles.heroCtas}>
                    <TouchableOpacity style={styles.heroPrimaryBtn} onPress={handleGetStarted}>
                      <View style={styles.heroPrimaryBtnGlassy}>
                        <Text style={styles.heroPrimaryBtnText}>Start Learning Free</Text>
                        <Feather name="arrow-right" size={20} color={colors.primary[600]} style={{ marginLeft: 8 }} />
                      </View>
                    </TouchableOpacity>
                  </View>
                </FadeIn>

                <FadeIn delay={400}>
                  <Text style={styles.heroTrust}>
                    Built by dental professionals, for dental professionals
                  </Text>
                </FadeIn>
              </View>

              {/* Hero Visual */}
              {isMediumScreen && (
                <FadeIn delay={300} style={styles.heroVisual}>
                  <View style={styles.chatPreview}>
                    <View style={styles.chatPreviewHeader}>
                      <View style={styles.chatPreviewHeaderLeft}>
                        <RootedLogo size={100} showText={true} />
                      </View>
                      <View style={styles.chatPreviewLive}>
                        <View style={styles.chatPreviewLiveDot} />
                        <Text style={styles.chatPreviewLiveText}>Live</Text>
                      </View>
                    </View>

                    <View style={styles.chatMessages}>
                      <View style={styles.userMsg}>
                        <Text style={styles.userMsgText}>What are the stages of tooth development?</Text>
                      </View>
                      <View style={styles.aiMsg}>
                        <Text style={styles.aiMsgText}>
                          Tooth development occurs in three main stages:{'\n\n'}
                          <Text style={styles.aiMsgBold}>1. Bud Stage</Text> - Initial epithelial thickening{'\n'}
                          <Text style={styles.aiMsgBold}>2. Cap Stage</Text> - Enamel organ formation{'\n'}
                          <Text style={styles.aiMsgBold}>3. Bell Stage</Text> - Cell differentiation begins
                        </Text>
                      </View>
                    </View>

                    <View style={styles.chatInput}>
                      <Text style={styles.chatInputPlaceholder}>Ask anything about dentistry...</Text>
                      <Feather name="send" size={18} color={colors.primary[300]} />
                    </View>
                  </View>
                </FadeIn>
              )}
            </View>
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection} ref={featuresRef} collapsable={false}>
            <View style={styles.sectionHeader}>
              <FadeIn>
                <Text style={styles.sectionLabel}>FEATURES</Text>
                <Text style={[styles.sectionTitle, { fontSize: isLargeScreen ? 40 : 32 }]}>
                  Everything You Need to Excel
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Designed by dental students, for dental students
                </Text>
              </FadeIn>
            </View>

            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <FeatureCard
                  key={feature.title}
                  icon={feature.icon}
                  iconType={feature.iconType}
                  title={feature.title}
                  description={feature.description}
                  index={index}
                  cardWidth={getCardWidth()}
                />
              ))}
            </View>
          </View>

          {/* Story Section */}
          <View ref={storyRef} collapsable={false}>
          <View style={styles.storyGradient}>
            <View style={styles.storySection}>
              <View style={styles.sectionHeader}>
                <FadeIn>
                  <Text style={styles.sectionLabel}>OUR STORY</Text>
                  <Text style={[styles.sectionTitle, { fontSize: isLargeScreen ? 40 : 32 }]}>
                    Born from Real Struggles
                  </Text>
                </FadeIn>
              </View>

              <FadeIn>
                <View style={[styles.storyCard, { flexDirection: isMediumScreen ? 'row' : 'column' }]}>
                  <View style={[styles.storyLeft, { borderRightWidth: isMediumScreen ? 1 : 0, borderBottomWidth: isMediumScreen ? 0 : 1 }]}>
                    <Text style={styles.storyLabel}>Why We Started</Text>
                    <Text style={styles.storyTagline}>A mission to transform dental education</Text>
                  </View>

                  <View style={styles.storyRight}>
                    <Text style={styles.storyParagraph}>
                      <Text style={styles.storyHighlight}>RootED</Text> was born from a simple frustration that every dental student knows too well.
                    </Text>
                    <Text style={styles.storyParagraph}>
                      Late nights spent searching through scattered notes. Endless hours trying to understand complex procedures. The overwhelming feeling before exams.
                    </Text>
                    <Text style={styles.storyParagraph}>
                      <Text style={styles.storyHighlight}>We asked ourselves:</Text> What if there was a study companion that actually understood dentistry? One that could explain complex concepts simply?
                    </Text>
                    <View style={styles.storyQuote}>
                      <Text style={styles.storyQuoteText}>
                        "Because every dental professional deserves the best tools to succeed."
                      </Text>
                    </View>
                  </View>
                </View>
              </FadeIn>

              {/* Stats */}
              <View style={styles.statsRow}>
                {stats.map((stat, index) => (
                  <StatCard key={stat.label} value={stat.value} label={stat.label} index={index} />
                ))}
              </View>
            </View>
          </View>
          </View>

          {/* About Section */}
          <View style={styles.aboutSection} ref={aboutRef} collapsable={false}>
            <View style={styles.sectionHeader}>
              <FadeIn>
                <Text style={styles.sectionLabel}>ABOUT US</Text>
                <Text style={[styles.sectionTitle, { fontSize: isLargeScreen ? 40 : 32 }]}>
                  Meet Our Founder
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Built by a dental professional who understands your journey
                </Text>
              </FadeIn>
            </View>

            <FadeIn>
              <View style={[styles.founderCard, { flexDirection: isMediumScreen ? 'row' : 'column' }]}>
                <View style={[styles.founderLeft, { borderRightWidth: isMediumScreen ? 1 : 0, borderBottomWidth: isMediumScreen ? 0 : 1 }]}>
                  <Text style={styles.founderName}>Charumathi</Text>
                  <Text style={styles.founderRole}>Founder & CEO</Text>
                  <View style={styles.founderBadge}>
                    <Ionicons name="school" size={14} color={colors.primary[500]} />
                    <Text style={styles.founderBadgeText}>Pursuing MDS</Text>
                  </View>
                </View>

                <View style={styles.founderRight}>
                  <Text style={styles.founderBio}>
                    As a dental postgraduate, I experienced firsthand the challenges of navigating complex subjects and preparing for competitive exams. I created RootED to be the study companion I wished I had.
                  </Text>
                  <Text style={styles.founderQuote}>
                    "My vision is to democratize dental education through AI, ensuring quality learning resources are available to every aspiring dentist."
                  </Text>
                </View>
              </View>
            </FadeIn>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <View style={styles.ctaCard}>
              <FadeIn>
                <Text style={[styles.ctaTitle, { fontSize: isLargeScreen ? 36 : 28 }]}>
                  Ready to Transform{'\n'}Your Learning?
                </Text>
                <Text style={styles.ctaSubtitle}>
                  Join dental students learning smarter with RootED. It's free to get started!
                </Text>
                <TouchableOpacity style={styles.ctaButton} onPress={handleGetStarted}>
                  <View style={styles.ctaButtonGlassy}>
                    <Text style={styles.ctaButtonText}>Get Started Free</Text>
                    <Feather name="arrow-right" size={18} color={colors.primary[600]} style={{ marginLeft: 8 }} />
                  </View>
                </TouchableOpacity>
              </FadeIn>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerTop}>
              <RootedLogo size={120} showText={true} />
              <Text style={styles.footerTagline}>Get to the root of it</Text>
            </View>
            <View style={styles.footerDivider} />
            <View style={[styles.footerBottom, { flexDirection: isMediumScreen ? 'row' : 'column', gap: isMediumScreen ? 0 : 16 }]}>
              <Text style={styles.footerCopyright}>© 2026 RootED. All rights reserved.</Text>
              <View style={styles.footerLinks}>
                <TouchableOpacity><Text style={styles.footerLink}>Privacy</Text></TouchableOpacity>
                <Text style={styles.footerLinkDot}>•</Text>
                <TouchableOpacity><Text style={styles.footerLink}>Terms</Text></TouchableOpacity>
                <Text style={styles.footerLinkDot}>•</Text>
                <TouchableOpacity><Text style={styles.footerLink}>Contact</Text></TouchableOpacity>
              </View>
            </View>
          </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

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
  // Decorative circles - blue theme
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 999,
  },
  circle1: {
    width: 400,
    height: 400,
    backgroundColor: colors.primary[200],
    opacity: 0.35,
    top: -150,
    right: -150,
  },
  circle2: {
    width: 300,
    height: 300,
    backgroundColor: colors.secondary[200],
    opacity: 0.25,
    bottom: 200,
    left: -120,
  },
  circle3: {
    width: 200,
    height: 200,
    backgroundColor: colors.primary[100],
    opacity: 0.4,
    top: '40%',
    right: -80,
  },
  circle4: {
    width: 250,
    height: 250,
    backgroundColor: colors.primary[100],
    opacity: 0.3,
    top: '60%',
    left: -100,
  },
  circleDark: {
    opacity: 0.2,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    marginLeft: 4,
  },
  navLinks: {
    flexDirection: 'row',
    marginRight: 16,
  },
  navLink: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  navLinkText: {
    fontSize: 15,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[600],
  },
  loginBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  loginBtnText: {
    fontSize: 15,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[700],
  },
  ctaBtn: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  ctaBtnGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  ctaBtnText: {
    fontSize: 15,
    fontFamily: typography.fontFamily.semiBold,
    color: '#FFFFFF',
  },

  // Hero
  heroGradient: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 48,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  heroContent: {
    flex: 1,
    minWidth: 320,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    alignSelf: 'flex-start',
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(16px)',
  },
  heroBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
    marginRight: 10,
  },
  heroBadgeText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary[700],
  },
  heroTitle: {
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral[800],
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  heroTitleAccent: {
    color: colors.primary[500],
  },
  heroSubtitle: {
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[500],
    marginBottom: 32,
    lineHeight: 28,
  },
  heroCtas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
    flexWrap: 'wrap',
  },
  heroPrimaryBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  heroPrimaryBtnGlassy: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 14,
    backdropFilter: 'blur(20px)',
  },
  heroPrimaryBtnText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary[600],
  },
  heroSecondaryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    backgroundColor: '#FFFFFF',
  },
  heroSecondaryBtnText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[700],
  },
  heroTrust: {
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[400],
  },

  // Hero Visual
  heroVisual: {
    flex: 1,
    minWidth: 360,
    maxWidth: 480,
  },
  chatPreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 20,
    padding: 20,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.12,
    shadowRadius: 40,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(24px)',
  },
  chatPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 16,
  },
  chatPreviewHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatPreviewDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary[500],
    marginRight: 10,
  },
  chatPreviewTitle: {
    fontSize: 16,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.neutral[800],
  },
  chatPreviewLive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success.light,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  chatPreviewLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success.main,
    marginRight: 6,
  },
  chatPreviewLiveText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
    color: colors.success.dark,
  },
  chatMessages: {
    gap: 12,
  },
  userMsg: {
    backgroundColor: colors.primary[500],
    padding: 14,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
    maxWidth: '85%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  userMsgText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  aiMsg: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 14,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
    maxWidth: '90%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  aiMsgText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[700],
    lineHeight: 22,
  },
  aiMsgBold: {
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary[700],
  },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  chatInputPlaceholder: {
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[400],
  },

  // Section Header
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 48,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary[500],
    letterSpacing: 2,
    marginBottom: 12,
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 17,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[500],
    textAlign: 'center',
    maxWidth: 500,
  },

  // Features
  featuresSection: {
    paddingHorizontal: 24,
    paddingVertical: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  featureCardWrapper: {
    // Width set dynamically
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 20,
    padding: 28,
    height: 220,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
    backdropFilter: 'blur(20px)',
  },
  featureCardHovered: {
    borderColor: colors.primary[200],
    shadowColor: colors.primary[400],
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
  },
  featureIconWrapper: {
    marginBottom: 20,
  },
  featureIconBg: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 18,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.neutral[900],
    marginBottom: 10,
  },
  featureDescription: {
    fontSize: 15,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[500],
    lineHeight: 22,
  },

  // Story
  storyGradient: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  storySection: {
    paddingHorizontal: 24,
    paddingVertical: 80,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  storyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 24,
    marginBottom: 48,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 900,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    overflow: 'hidden',
    backdropFilter: 'blur(24px)',
  },
  storyLeft: {
    padding: 40,
    justifyContent: 'center',
    borderColor: 'rgba(0, 0, 0, 0.06)',
    minWidth: 220,
  },
  storyLabel: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary[500],
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  storyTagline: {
    fontSize: 20,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.neutral[800],
    lineHeight: 28,
  },
  storyRight: {
    flex: 1,
    padding: 40,
  },
  storyParagraph: {
    fontSize: 16,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[600],
    lineHeight: 26,
    marginBottom: 16,
  },
  storyHighlight: {
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary[500],
  },
  storyQuote: {
    marginTop: 12,
    paddingLeft: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[400],
  },
  storyQuoteText: {
    fontSize: 17,
    fontFamily: typography.fontFamily.medium,
    fontStyle: 'italic',
    color: colors.neutral[700],
    lineHeight: 26,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    flexWrap: 'wrap',
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    minWidth: 140,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)',
  },
  statValue: {
    fontSize: 32,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary[500],
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[500],
  },

  // About
  aboutSection: {
    paddingHorizontal: 24,
    paddingVertical: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  founderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 24,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    overflow: 'hidden',
    backdropFilter: 'blur(24px)',
  },
  founderLeft: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'rgba(0, 0, 0, 0.06)',
    minWidth: 220,
  },
  founderRight: {
    flex: 1,
    padding: 40,
  },
  founderName: {
    fontSize: 28,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral[900],
    marginBottom: 6,
    textAlign: 'center',
  },
  founderRole: {
    fontSize: 16,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary[500],
    marginBottom: 16,
    textAlign: 'center',
  },
  founderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    gap: 8,
  },
  founderBadgeText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary[700],
  },
  founderBio: {
    fontSize: 16,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[600],
    lineHeight: 26,
    marginBottom: 20,
  },
  founderQuote: {
    fontSize: 15,
    fontFamily: typography.fontFamily.medium,
    fontStyle: 'italic',
    color: colors.neutral[500],
    lineHeight: 24,
    paddingLeft: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[400],
  },

  // CTA
  ctaSection: {
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  ctaCard: {
    borderRadius: 28,
    padding: 60,
    alignItems: 'center',
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 4,
    backdropFilter: 'blur(24px)',
  },
  ctaTitle: {
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral[800],
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  ctaSubtitle: {
    fontSize: 17,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 400,
    lineHeight: 26,
  },
  ctaButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  ctaButtonGlassy: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingVertical: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 14,
    backdropFilter: 'blur(20px)',
  },
  ctaButtonText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary[600],
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  footerTop: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  footerTagline: {
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    fontStyle: 'italic',
    color: colors.neutral[500],
  },
  footerDivider: {
    height: 1,
    backgroundColor: colors.neutral[100],
    marginBottom: 24,
  },
  footerBottom: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerCopyright: {
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[400],
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  footerLink: {
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[500],
  },
  footerLinkDot: {
    fontSize: 14,
    color: colors.neutral[300],
  },
});

export default LandingPage;
