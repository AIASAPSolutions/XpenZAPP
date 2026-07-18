import React, { useState } from 'react';
import { StyleSheet, View, Text, KeyboardAvoidingView, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Checkbox } from 'react-native-paper';
import * as Haptics from 'expo-haptics';

import { signupSchema } from '../../utils/validators';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import { useUiStore } from '../../store/uiStore';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

// Custom elements
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const SignupScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { signup, loading } = useAuth();
  const showToast = useUiStore((state) => state.showToast);
  const [accountType, setAccountType] = useState('individual');
  const [passwordInput, setPasswordInput] = useState('');

  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      accountType: 'individual',
      fullName: '',
      email: '',
      phone: '',
      subscriptionCode: '',
      password: '',
      confirmPassword: '',
      organizationName: '',
      organizationCode: '',
      role: '',
      agreeTerms: false,
    }
  });

  const handleAccountTypeChange = (type) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAccountType(type);
    setValue('accountType', type);
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return { label: 'Empty', score: 0, color: colors.border };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    if (score <= 2) return { label: 'Weak 🔴', score, color: colors.error };
    if (score <= 4) return { label: 'Good 🟡', score, color: colors.warning };
    return { label: 'Strong 💪🟢', score, color: colors.success };
  };

  const strength = getPasswordStrength(passwordInput);

  const onSubmit = async (data) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const result = await signup({ ...data, accountType });
    if (result.success && result.requiresOtp) {
      showToast("OTP sent to your email!", "success");
      navigation.navigate('OtpVerification', { email: data.email });
    } else if (!result.success) {
      showToast(result.error, "error");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Join XpenZtrack to capture business expenses dynamically
          </Text>
        </View>

        <View style={[styles.tabContainer, { backgroundColor: colors.primaryContainer }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleAccountTypeChange('individual')}
            style={[styles.tabBtn, accountType === 'individual' && { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.tabText, { color: accountType === 'individual' ? '#ffffff' : colors.onPrimaryContainer }]}>
              Individual
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleAccountTypeChange('organization')}
            style={[styles.tabBtn, accountType === 'organization' && { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.tabText, { color: accountType === 'organization' ? '#ffffff' : colors.onPrimaryContainer }]}>
              Organization
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>

          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Full Name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Rahul Sharma"
                icon="account-outline"
                error={errors.fullName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email Address"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="rahul@asap.org"
                keyboardType="email-address"
                icon="email-outline"
                error={errors.email?.message}
                autoCapitalize="none"
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Mobile Number (Optional)"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="10-digit Indian mobile number"
                keyboardType="phone-pad"
                icon="phone-outline"
                error={errors.phone?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="subscriptionCode"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Subscription Code"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Enter your subscription enrollment code"
                icon="ticket-confirmation-outline"
                error={errors.subscriptionCode?.message}
                autoCapitalize="characters"
              />
            )}
          />

          {accountType === 'organization' && (
            <>
              <Controller
                control={control}
                name="organizationName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Organization / Company Name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="AI ASAP Solutions"
                    icon="office-building"
                    error={errors.organizationName?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="organizationCode"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Company Code (to join an org)"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="e.g. C8D818D1"
                    icon="office-building-outline"
                    error={errors.organizationCode?.message}
                    autoCapitalize="characters"
                  />
                )}
              />

              <Controller
                control={control}
                name="role"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Designation / Role"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Finance Manager, Director"
                    icon="card-account-details-outline"
                    error={errors.role?.message}
                  />
                )}
              />
            </>
          )}

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password"
                value={value}
                onChangeText={(text) => { onChange(text); setPasswordInput(text); }}
                onBlur={onBlur}
                placeholder="Password (min 6 characters)"
                secureTextEntry
                icon="lock-outline"
                error={errors.password?.message}
                autoCapitalize="none"
              />
            )}
          />

          {passwordInput.length > 0 && (
            <View style={styles.strengthWrapper}>
              <View style={styles.strengthHeader}>
                <Text style={[styles.strengthLabel, { color: colors.textSecondary }]}>Password Strength:</Text>
                <Text style={[styles.strengthScore, { color: strength.color }]}>{strength.label}</Text>
              </View>
              <View style={[styles.strengthBarBg, { backgroundColor: colors.border }]}>
                <View style={[styles.strengthBarActive, { backgroundColor: strength.color, width: `${(strength.score / 5) * 100}%` }]} />
              </View>
            </View>
          )}

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Confirm Password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Confirm password"
                secureTextEntry
                icon="lock-check-outline"
                error={errors.confirmPassword?.message}
                autoCapitalize="none"
              />
            )}
          />

          <Controller
            control={control}
            name="agreeTerms"
            render={({ field: { onChange, value } }) => (
              <View style={styles.termsWrapper}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => onChange(!value)}
                  style={styles.checkboxContainer}
                >
                  <Checkbox
                    status={value ? 'checked' : 'unchecked'}
                    color={colors.primary}
                    onPress={() => onChange(!value)}
                  />
                  <Text style={[styles.checkboxLabel, { color: colors.textSecondary }]}>
                    I agree to the Terms & Conditions and Privacy Policy
                  </Text>
                </TouchableOpacity>
                {errors.agreeTerms && (
                  <Text style={[styles.errorText, { color: colors.error }]}>{errors.agreeTerms.message}</Text>
                )}
              </View>
            )}
          />

          <Button
            title="Create Account"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            variant="primary"
            style={styles.submitBtn}
          />
        </View>

        <View style={styles.loginLinkWrapper}>
          <Text style={[styles.loginText, { color: colors.textSecondary }]}>Already have an account? </Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.loginLink, { color: colors.primary }]}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.xl, paddingTop: 48, paddingBottom: 48 },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  title: { fontFamily: typography.fontFamily, fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, marginBottom: spacing.xs },
  subtitle: { fontFamily: typography.fontFamily, fontSize: typography.sizes.sm + 1, textAlign: 'center', paddingHorizontal: spacing.sm },
  tabContainer: { flexDirection: 'row', padding: 4, borderRadius: spacing.borderRadius.md, marginBottom: spacing.xl },
  tabBtn: { flex: 1, paddingVertical: spacing.md, alignItems: 'center', justifyContent: 'center', borderRadius: spacing.borderRadius.md - 2 },
  tabText: { fontFamily: typography.fontFamily, fontSize: typography.sizes.sm + 1, fontWeight: typography.weights.bold },
  form: { width: '100%' },
  strengthWrapper: { marginBottom: spacing.md },
  strengthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  strengthLabel: { fontFamily: typography.fontFamily, fontSize: typography.sizes.xs, fontWeight: typography.weights.medium },
  strengthScore: { fontFamily: typography.fontFamily, fontSize: typography.sizes.xs, fontWeight: typography.weights.bold },
  strengthBarBg: { height: 6, borderRadius: 3, width: '100%', overflow: 'hidden' },
  strengthBarActive: { height: '100%' },
  termsWrapper: { marginBottom: spacing.xl },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: -8 },
  checkboxLabel: { fontFamily: typography.fontFamily, fontSize: typography.sizes.sm - 1, fontWeight: typography.weights.medium, flex: 1 },
  errorText: { fontSize: typography.sizes.xs, fontWeight: typography.weights.medium, marginTop: spacing.xs, marginLeft: 24 },
  submitBtn: { width: '100%', marginBottom: spacing.xl },
  loginLinkWrapper: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { fontFamily: typography.fontFamily, fontSize: typography.sizes.sm + 1, fontWeight: typography.weights.medium },
  loginLink: { fontFamily: typography.fontFamily, fontSize: typography.sizes.sm + 1, fontWeight: typography.weights.bold },
});
export default SignupScreen;
