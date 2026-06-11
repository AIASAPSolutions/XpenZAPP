import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, Animated, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUiStore } from '../../store/uiStore';
import useTheme from '../../hooks/useTheme';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

export const Toast = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const toasts = useUiStore((state) => state.toasts);
  const hideToast = useUiStore((state) => state.hideToast);

  if (toasts.length === 0) return null;

  // Render only the latest toast
  const activeToast = toasts[toasts.length - 1];

  return (
    <ToastItem
      key={activeToast.id}
      toast={activeToast}
      topInset={insets.top}
      onDismiss={() => hideToast(activeToast.id)}
      colors={colors}
    />
  );
};

const ToastItem = ({ toast, topInset, onDismiss, colors }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    // Slide Down
    Animated.spring(slideAnim, {
      toValue: topInset + spacing.sm,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();

    return () => {
      // Clean slide up
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    };
  }, [slideAnim, topInset]);

  const getToastStyle = () => {
    switch (toast.type) {
      case 'success':
        return { bg: colors.success, icon: 'check-circle' };
      case 'error':
        return { bg: colors.error, icon: 'alert-circle' };
      case 'info':
      default:
        return { bg: colors.primary, icon: 'information' };
    }
  };

  const { bg, icon } = getToastStyle();

  return (
    <Animated.View
      style={[
        styles.toastWrapper,
        {
          transform: [{ translateY: slideAnim }],
          backgroundColor: bg,
        },
      ]}
    >
      <MaterialCommunityIcons name={icon} size={22} color="#ffffff" style={styles.icon} />
      <Text style={styles.messageText}>{toast.message}</Text>
      <TouchableOpacity activeOpacity={0.7} onPress={onDismiss} style={styles.closeBtn}>
        <MaterialCommunityIcons name="close" size={18} color="rgba(255, 255, 255, 0.7)" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.borderRadius.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  icon: {
    marginRight: spacing.sm + 2,
  },
  messageText: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.semibold,
    color: '#ffffff',
  },
  closeBtn: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
});
export default Toast;
