import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import useTheme from '../../hooks/useTheme';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

export const Badge = ({
  text,
  variant = 'primary', // 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'accent'
  style,
  textStyle,
}) => {
  const { colors } = useTheme();

  const getColors = () => {
    switch (variant) {
      case 'primary':
        return { bg: colors.primaryContainer, txt: colors.onPrimaryContainer };
      case 'success':
        return { bg: '#dcfce7', txt: '#15803d' }; // Soft green in standard light themes
      case 'warning':
        return { bg: '#fef3c7', txt: '#b45309' };
      case 'error':
        return { bg: '#fee2e2', txt: '#b91c1c' };
      case 'accent':
        return { bg: '#e0e7ff', txt: '#4338ca' };
      case 'neutral':
      default:
        return { bg: colors.divider, txt: colors.textSecondary };
    }
  };

  const { bg, txt } = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: txt }, textStyle]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 1,
    borderRadius: spacing.borderRadius.round,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs - 1,
    fontWeight: typography.weights.bold,
  },
});
export default Badge;
