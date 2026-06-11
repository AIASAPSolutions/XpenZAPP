import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Button from './Button';
import useTheme from '../../hooks/useTheme';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

export const EmptyState = ({
  icon = 'wallet-outline',
  title = 'No Data Found',
  description = 'There is nothing logged in this section yet.',
  actionTitle,
  onActionPress,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconWrapper, { backgroundColor: colors.primaryContainer }]}>
        <MaterialCommunityIcons name={icon} size={48} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
      {actionTitle && onActionPress && (
        <Button
          title={actionTitle}
          onPress={onActionPress}
          variant="secondary"
          style={styles.actionBtn}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    marginVertical: spacing.xl,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm + 1,
    textAlign: 'center',
    lineHeight: typography.lineHeights.sm,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  actionBtn: {
    minWidth: 160,
  },
});
export default EmptyState;
