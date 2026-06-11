import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import useTheme from '../../hooks/useTheme';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { openAppDrawer } from '../../utils/navigation';

export const ScreenHeader = ({
  title,
  subtitle,
  navigation,
  showMenu = true,
  rightAction,
}) => {
  const { colors } = useTheme();

  const handleMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openAppDrawer(navigation);
  };

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {showMenu && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleMenu}
            style={[styles.menuBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
          >
            <MaterialCommunityIcons name="menu" size={22} color={colors.text} />
          </TouchableOpacity>
        )}
        <View style={!showMenu && styles.titleOnly}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
          ) : null}
        </View>
      </View>
      {rightAction ? <View>{rightAction}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
    paddingBottom: spacing.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  titleOnly: {
    flex: 1,
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xxl - 2,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginTop: 2,
  },
});

export default ScreenHeader;
