import React from 'react';
import { StyleSheet, View } from 'react-native';
import useTheme from '../../hooks/useTheme';
import { spacing } from '../../constants/spacing';

export const Divider = ({ style, vertical = false }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        vertical ? styles.vertical : styles.horizontal,
        { backgroundColor: colors.divider },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  horizontal: {
    height: 1.5,
    width: '100%',
    marginVertical: spacing.md,
  },
  vertical: {
    width: 1.5,
    height: '100%',
    marginHorizontal: spacing.md,
  },
});
export default Divider;
