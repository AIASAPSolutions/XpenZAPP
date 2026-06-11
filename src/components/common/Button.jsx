import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import useTheme from '../../hooks/useTheme';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

export const Button = ({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'text'
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const { colors } = useTheme();

  const handlePress = () => {
    if (loading || disabled) return;
    
    // Play subtle physical snap feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (onPress) {
      onPress();
    }
  };

  const getStyles = () => {
    let btnStyle = { ...styles.btn };
    let txtStyle = { ...styles.text };

    if (variant === 'primary') {
      btnStyle.backgroundColor = colors.primary;
      txtStyle.color = '#ffffff';
    } else if (variant === 'secondary') {
      btnStyle.backgroundColor = colors.primaryContainer;
      txtStyle.color = colors.onPrimaryContainer;
    } else if (variant === 'outline') {
      btnStyle.backgroundColor = 'transparent';
      btnStyle.borderWidth = 1.5;
      btnStyle.borderColor = colors.primary;
      txtStyle.color = colors.primary;
    } else if (variant === 'danger') {
      btnStyle.backgroundColor = colors.error;
      txtStyle.color = '#ffffff';
    } else if (variant === 'text') {
      btnStyle.backgroundColor = 'transparent';
      btnStyle.paddingVertical = spacing.sm;
      btnStyle.paddingHorizontal = spacing.sm;
      txtStyle.color = colors.primary;
    }

    if (disabled) {
      btnStyle.backgroundColor = variant === 'outline' || variant === 'text' ? 'transparent' : colors.border;
      btnStyle.borderColor = variant === 'outline' ? colors.border : 'transparent';
      txtStyle.color = colors.textSecondary;
    }

    return { btnStyle, txtStyle };
  };

  const { btnStyle, txtStyle } = getStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[btnStyle, style]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' || variant === 'text' ? colors.primary : '#ffffff'} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[txtStyle, textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: spacing.borderRadius.md,
    gap: spacing.sm,
  },
  text: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});
export default Button;
