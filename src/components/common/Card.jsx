import React from 'react';
import { StyleSheet, View } from 'react-native';
import useTheme from '../../hooks/useTheme';
import { spacing } from '../../constants/spacing';

export const Card = ({ children, style, elevation = 'light', ...props }) => {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: isDark ? 1 : 0,
          ...spacing.shadows[elevation],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
  },
});
export default Card;
