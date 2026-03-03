/**
 * TypingIndicator Component
 * Animated typing indicator for chat assistant - Web compatible
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import designSystem from '../utils/designSystem';

const { colors, spacing, borderRadius } = designSystem;

const DOT_SIZE = 8;

export default function TypingIndicator({ style }) {
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDot((prev) => (prev + 1) % 3);
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.bubble}>
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeDot === index && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    marginBottom: spacing[3],
    marginLeft: spacing[4],
  },
  bubble: {
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius['2xl'],
    borderTopLeftRadius: borderRadius.sm,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.neutral[300],
    transition: 'transform 0.2s, opacity 0.2s, background-color 0.2s',
  },
  dotActive: {
    backgroundColor: colors.primary[400],
    transform: [{ translateY: -4 }],
  },
});
