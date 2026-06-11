import React, { useState } from 'react';
import { StyleSheet, View, Text, KeyboardAvoidingView, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { forgotPasswordSchema } from '../../utils/validators';
import * as authApi from '../../api/auth';
import useTheme from '../../hooks/useTheme';
import { useUiStore } from '../../store/uiStore';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

// Custom elements
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const ForgotPasswordScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const showToast = useUiStore((state) => state.showToast);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { control, handleSubmit, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  });

  const onSubmit = async (data) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setSuccess(true);
      showToast("Reset instructions dispatched!", "success");
    } catch (e) {
      showToast("Failed to initiate password reset request.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Navigation back triggers */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Login')}
          style={styles.backBtn}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>

        {success ? (
          /* SUCCESS STATE PANEL */
          <View style={styles.successWrapper}>
            <View style={[styles.successIconWrapper, { backgroundColor: colors.primaryContainer }]}>
              <MaterialCommunityIcons name="email-check-outline" size={64} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Check Your Inbox</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              We have dispatched password reset guidelines to:
            </Text>
            <Text style={[styles.targetEmail, { color: colors.primary }]}>{getValues('email')}</Text>
            
            <Button
              title="Return to Login"
              onPress={() => navigation.navigate('Login')}
              variant="primary"
              style={styles.actionBtn}
            />
          </View>
        ) : (
          /* FORM SUBMISSION PANEL */
          <View style={styles.formWrapper}>
            <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Enter your corporate email address. We will dispatch instructions to configure a new credential.
            </Text>

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Corporate Email Address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="e.g., rahul@asap.org"
                  keyboardType="email-address"
                  icon="email-outline"
                  error={errors.email?.message}
                  autoCapitalize="none"
                />
              )}
            />

            <Button
              title="Send Reset Link"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              variant="primary"
              style={styles.actionBtn}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: 64,
    paddingBottom: 48,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  formWrapper: {
    width: '100%',
  },
  successWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  successIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.sm + 2,
    marginBottom: spacing.xxl,
  },
  targetEmail: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xxxl,
  },
  actionBtn: {
    width: '100%',
  },
});
export default ForgotPasswordScreen;
