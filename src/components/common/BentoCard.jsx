import React from 'react';
import { View, StyleSheet } from 'react-native';
import useTheme from '../../hooks/useTheme';

export const BentoCard = ({
  children,
  style,
  size = 'full', // 'full' | 'half' | 'third'
  accent = false,
  ...props
}) => {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={[
        styles.card,
        size === 'half' && styles.half,
        size === 'third' && styles.third,
        {
          backgroundColor: accent ? colors.primary : isDark ? '#1C1C1E' : '#FFFFFF',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
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
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  half: {
    width: '48.5%',
  },
  third: {
    width: '31%',
  },
});
export default BentoCard;
