import React from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import useTheme from '../../hooks/useTheme';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

export const LoadingSpinner = ({ message = 'Loading...', fullScreen = false }) => {
  const { colors } = useTheme();

  const spinner = (
    <View style={styles.spinnerContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && <Text style={[styles.text, { color: colors.textSecondary }]}>{message}</Text>}
    </View>
  );

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
        {spinner}
      </View>
    );
  }

  return spinner;
};

const styles = StyleSheet.create({
  spinnerContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.medium,
  },
});
export default LoadingSpinner;
