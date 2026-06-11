import { MD3LightTheme } from 'react-native-paper';
import { colors } from '../constants/colors';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    tertiary: colors.accent,
    background: colors.light.background,
    surface: colors.light.surface,
    outline: colors.light.border,
    error: colors.error,
    success: colors.success,
    warning: colors.warning,
    
    // Custom elements
    card: colors.light.card,
    text: colors.light.text,
    textSecondary: colors.light.textSecondary,
    border: colors.light.border,
    primaryContainer: colors.light.primaryContainer,
    onPrimaryContainer: colors.light.onPrimaryContainer,
    divider: colors.light.divider,
    glass: colors.light.glass,
    shadow: colors.light.shadow,
  },
  roundness: 3, // MD3 roundness multiplier
};
