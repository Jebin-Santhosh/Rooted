/**
 * DocumentBadge Component
 * Modern badge showing document source - Web compatible
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import designSystem from '../utils/designSystem';

const { colors, spacing, borderRadius, typography, scale } = designSystem;

export default function DocumentBadge({ title, onPress }) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={styles.badge}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <MaterialIcons name="description" size={14} color={colors.primary[600]} />
      <Text style={styles.text} numberOfLines={1}>
        {title}
      </Text>
    </Container>
  );
}

export function ReasoningCard({ reasoning }) {
  if (!reasoning) return null;

  return (
    <View style={styles.reasoningCard}>
      <View style={styles.reasoningHeader}>
        <MaterialIcons name="psychology" size={16} color={colors.primary[500]} />
        <Text style={styles.reasoningLabel}>AI Reasoning</Text>
      </View>
      <Text style={styles.reasoningText}>{reasoning}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: borderRadius.full,
    gap: spacing[1.5],
    marginRight: spacing[2],
    marginBottom: spacing[2],
  },
  text: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.primary[700],
    maxWidth: scale(150),
  },
  reasoningCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginHorizontal: spacing[4],
    marginBottom: spacing[3],
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  reasoningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    marginBottom: spacing[1.5],
  },
  reasoningLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.primary[600],
  },
  reasoningText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[600],
    fontStyle: 'italic',
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
});






