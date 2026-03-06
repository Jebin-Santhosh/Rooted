/**
 * Sidebar Component
 * RootED - Glassy blue design matching landing page
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import RootedLogo from './RootedLogo';
import { useOnboarding } from '../context/OnboardingContext';
import { useThemeMode } from '../context/ThemeContext';
import designSystem from '../utils/designSystem';

const { colors, spacing, borderRadius, typography } = designSystem;

const SIDEBAR_WIDTH = 280;

const ChatHistoryItem = ({ title, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.chatHistoryItem, isActive && styles.chatHistoryItemActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <MaterialIcons
      name="chat-bubble-outline"
      size={16}
      color={isActive ? colors.primary[500] : colors.neutral[500]}
    />
    <Text style={[styles.chatHistoryTitle, isActive && styles.chatHistoryTitleActive]} numberOfLines={1}>
      {title}
    </Text>
  </TouchableOpacity>
);

const MenuItem = ({ icon, label, onPress, danger = false }) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <MaterialIcons
      name={icon}
      size={20}
      color={danger ? colors.error.main : colors.neutral[600]}
    />
    <Text style={[styles.menuItemLabel, danger && styles.menuItemLabelDanger]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default function Sidebar({
  isOpen,
  onClose,
  onNavigate,
  chatHistory = [],
  onNewChat,
  isLargeScreen = false,
}) {
  const insets = useSafeAreaInsets();
  const { userProfile, logout } = useOnboarding();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { isDark } = useThemeMode();

  // Get user initials
  const getInitials = () => {
    const first = userProfile?.firstName?.[0] || '';
    const last = userProfile?.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  // Get display name
  const getDisplayName = () => {
    if (userProfile?.firstName) {
      return `${userProfile.firstName}${userProfile.lastName ? ' ' + userProfile.lastName : ''}`;
    }
    return userProfile?.email?.split('@')[0] || 'User';
  };

  // Handle logout
  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out?')) {
        logout();
        setShowProfileMenu(false);
        onClose?.();
      }
    } else {
      Alert.alert(
        'Log Out',
        'Are you sure you want to log out?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Log Out',
            style: 'destructive',
            onPress: () => {
              logout();
              setShowProfileMenu(false);
              onClose?.();
            }
          },
        ]
      );
    }
  };

  // Handle delete account
  const handleDeleteAccount = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        alert('Account deletion will be implemented in a future update.');
      }
    } else {
      Alert.alert(
        'Delete Account',
        'Are you sure you want to delete your account? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              Alert.alert('Coming Soon', 'Account deletion will be implemented in a future update.');
            }
          },
        ]
      );
    }
  };

  // Don't render anything if closed
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay - only show on small screens */}
      {!isLargeScreen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />
      )}

      <View
        style={[
          isLargeScreen ? styles.sidebarDesktop : styles.sidebar,
          isDark && styles.sidebarDark,
          { paddingTop: insets.top + spacing[3] },
        ]}
      >
        {/* Background gradient */}
        <LinearGradient
          colors={
            isDark
              ? [colors.neutral[900], '#020617']
              : colors.gradients.background
          }
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* Clean background - no decorative elements */}

        {/* Logo & New Chat */}
        <View style={styles.header}>
          <RootedLogo size={80} showText={true} />
        </View>

        <TouchableOpacity
          style={styles.newChatButton}
          onPress={onNewChat}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[colors.primary[400], colors.primary[500]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.newChatGradient}
          >
            <MaterialIcons name="add" size={20} color={colors.neutral[0]} />
            <Text style={styles.newChatText}>New chat</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Chat History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>YOUR CHATS</Text>
          <ScrollView
            style={styles.historyScroll}
            showsVerticalScrollIndicator={false}
          >
            {chatHistory.length > 0 ? (
              chatHistory.map((chat, index) => (
                <ChatHistoryItem
                  key={chat.id || index}
                  title={chat.title}
                  isActive={chat.isActive}
                  onPress={() => onNavigate('chat', { chatId: chat.id })}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons
                  name="chat-bubble-outline"
                  size={32}
                  color={isDark ? colors.neutral[600] : colors.neutral[300]}
                />
                <Text style={styles.emptyText}>No chats yet</Text>
                <Text style={styles.emptySubtext}>Start a conversation!</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Profile Section */}
        <View style={[styles.profileSection, { paddingBottom: insets.bottom + spacing[3] }]}>
          <TouchableOpacity
            style={styles.profileCard}
            onPress={() => setShowProfileMenu(!showProfileMenu)}
            activeOpacity={0.7}
          >
            {userProfile?.photoUrl ? (
              <Image
                source={{ uri: userProfile.photoUrl }}
                style={styles.profileAvatar}
              />
            ) : (
              <View style={styles.profileAvatarPlaceholder}>
                <Text style={styles.profileAvatarText}>{getInitials()}</Text>
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, isDark && styles.profileNameDark]} numberOfLines={1}>{getDisplayName()}</Text>
              <Text style={[styles.profileEmail, isDark && styles.profileEmailDark]} numberOfLines={1}>{userProfile?.email || ''}</Text>
            </View>
            <MaterialIcons
              name={showProfileMenu ? 'expand-less' : 'expand-more'}
              size={24}
              color={colors.neutral[500]}
            />
          </TouchableOpacity>

          {/* Profile Menu */}
          {showProfileMenu && (
            <View style={styles.profileMenu}>
              <MenuItem
                icon="person-outline"
                label="Edit Profile"
                onPress={() => {
                  setShowProfileMenu(false);
                  onNavigate?.('profile');
                }}
              />
              <MenuItem
                icon="settings"
                label="Settings"
                onPress={() => {
                  setShowProfileMenu(false);
                  onNavigate?.('settings');
                }}
              />
              <View style={styles.menuDivider} />
              <MenuItem
                icon="logout"
                label="Log Out"
                onPress={handleLogout}
              />
              <MenuItem
                icon="delete-outline"
                label="Delete Account"
                onPress={handleDeleteAccount}
                danger
              />
            </View>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 999,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    overflow: 'hidden',
    zIndex: 1000,
    ...Platform.select({
      web: {
        boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 10,
      },
    }),
  },
  sidebarDesktop: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    overflow: 'hidden',
    zIndex: 1,
    borderRightWidth: 1,
    borderRightColor: colors.neutral[200],
  },
  sidebarDark: {
    borderRightColor: 'rgba(15, 23, 42, 0.9)',
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  // Decorative circles removed for clean design
  header: {
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
    zIndex: 1,
  },
  newChatButton: {
    marginHorizontal: spacing[3],
    marginBottom: spacing[4],
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    zIndex: 1,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
      },
      default: {
        shadowColor: colors.primary[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 4,
      },
    }),
  },
  newChatGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
  newChatText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.neutral[0],
  },
  historySection: {
    flex: 1,
    paddingHorizontal: spacing[2],
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral[500],
    letterSpacing: 1,
    paddingHorizontal: spacing[3],
    marginBottom: spacing[2],
  },
  historyScroll: {
    flex: 1,
  },
  chatHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2.5],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.md,
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  chatHistoryItemActive: {
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  chatHistoryTitle: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[700],
  },
  chatHistoryTitleActive: {
    color: colors.primary[600],
    fontFamily: typography.fontFamily.medium,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing[8],
    gap: spacing[2],
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[500],
  },
  emptySubtext: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[400],
  },

  // Profile Section
  profileSection: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    paddingTop: spacing[3],
    paddingHorizontal: spacing[3],
    zIndex: 1,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: borderRadius.md,
    gap: spacing[3],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[200],
  },
  profileAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.neutral[0],
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.neutral[800],
    marginBottom: 2,
  },
  profileNameDark: {
    color: colors.neutral[100],
  },
  profileEmail: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[500],
  },
  profileEmailDark: {
    color: colors.neutral[200],
  },

  // Profile Menu
  profileMenu: {
    marginTop: spacing[2],
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    paddingVertical: spacing[1],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...Platform.select({
      web: {
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
      },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2.5],
    paddingHorizontal: spacing[3],
    gap: spacing[3],
  },
  menuItemLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[700],
  },
  menuItemLabelDanger: {
    color: colors.error.main,
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    marginVertical: spacing[1],
    marginHorizontal: spacing[3],
  },
});
