import { MD3DarkTheme } from 'react-native-paper';
import { colors } from '../constants/colors';

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.secondary, // In dark mode, lighter secondary is more accessible
    secondary: colors.accent,
    tertiary: colors.accent,
    background: colors.dark.background,
    surface: colors.dark.surface,
    outline: colors.dark.border,
    error: colors.error,
    success: colors.success,
    warning: colors.warning,
    
    // Custom elements
    card: colors.dark.card,
    text: colors.dark.text,
    textSecondary: colors.dark.textSecondary,
    border: colors.dark.border,
    primaryContainer: colors.dark.primaryContainer,
    onPrimaryContainer: colors.dark.onPrimaryContainer,
    divider: colors.dark.divider,
    glass: colors.dark.glass,
    shadow: colors.dark.shadow,
  },
  roundness: 3,
};
