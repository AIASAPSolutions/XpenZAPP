import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, View } from 'react-native';
import useTheme from '../../hooks/useTheme';
import { spacing } from '../../constants/spacing';

export const SkeletonLoader = ({
  width = '100%',
  height = 80,
  borderRadius = spacing.borderRadius.md,
  style,
}) => {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Fade loop animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border, // Use the border/divider color for skeleton segments
          opacity,
        },
        style,
      ]}
    />
  );
};

// Provides a complete row block structure for simple imports
export const SkeletonCardList = ({ count = 3 }) => {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, idx) => (
        <View key={`skel-${idx}`} style={styles.cardSkel}>
          <SkeletonLoader width={48} height={48} borderRadius={24} />
          <View style={styles.rowRight}>
            <SkeletonLoader width="65%" height={16} style={{ marginBottom: spacing.sm }} />
            <SkeletonLoader width="40%" height={12} />
          </View>
          <SkeletonLoader width={60} height={20} style={{ marginLeft: 'auto' }} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  list: {
    gap: spacing.md,
  },
  cardSkel: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0', // Placeholder light border
    backgroundColor: '#ffffff',
  },
  rowRight: {
    flex: 1,
    marginLeft: spacing.md,
  },
});
export default SkeletonLoader;
