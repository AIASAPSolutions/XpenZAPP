import React, { useState } from 'react';
import { StyleSheet, View, Text, KeyboardAvoidingView, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Checkbox } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { loginSchema } from '../../utils/validators';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import { useUiStore } from '../../store/uiStore';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { colors as brandColors } from '../../constants/colors';

// Custom elements
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Divider from '../../components/common/Divider';

export const LoginScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { login, loading } = useAuth();
  const showToast = useUiStore((state) => state.showToast);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    }
  });

  const onSubmit = async (data) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await login(data.email, data.password, data.rememberMe);
    if (result.success) {
      showToast("Welcome back, Rahul!", "success");
    } else {
      showToast(result.error, "error");
    }
  };

  const handleGoogleSignIn = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast("Google Sign-In simulation active.", "success");
    // Mock login immediately
    login('rahul@asap.org', 'password123');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.header}>
          <View style={[styles.logo, { backgroundColor: colors.primaryContainer }]}>
            <Text style={[styles.logoText, { color: colors.primary }]}>XP</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sign in to manage your business expenses instantly
          </Text>
        </View>

        {/* Input Forms */}
        <View style={styles.form}>
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

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Account Password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Enter password"
                secureTextEntry
                icon="lock-outline"
                error={errors.password?.message}
                autoCapitalize="none"
              />
            )}
          />

          {/* Remember me & forgot password row */}
          <View style={styles.forgotWrapper}>
            <Controller
              control={control}
              name="rememberMe"
              render={({ field: { onChange, value } }) => (
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
                    Remember Me
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Full Width Submit Button */}
          <Button
            title="Log In"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            variant="primary"
            style={styles.submitBtn}
          />
        </View>

        {/* Divider */}
        <View style={styles.dividerWrapper}>
          <Divider />
          <Text style={[styles.dividerLabel, { color: colors.textSecondary, backgroundColor: colors.background }]}>
            or continue with
          </Text>
        </View>

        {/* Google sign-in */}
        <Button
          title="Sign in with Google"
          onPress={handleGoogleSignIn}
          variant="outline"
          icon={<MaterialCommunityIcons name="google" size={20} color={colors.primary} />}
          style={styles.socialBtn}
        />

        {/* Link to Signup */}
        <View style={styles.signupLinkWrapper}>
          <Text style={[styles.signupText, { color: colors.textSecondary }]}>Don't have an account? </Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Signup')}>
            <Text style={[styles.signupLink, { color: colors.primary }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
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
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xl + 2,
    fontWeight: typography.weights.black,
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm + 1,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  form: {
    width: '100%',
  },
  forgotWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -8, // Align with left margin
  },
  checkboxLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  forgotText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  submitBtn: {
    width: '100%',
  },
  dividerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xl,
    position: 'relative',
  },
  dividerLabel: {
    position: 'absolute',
    paddingHorizontal: spacing.md,
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  socialBtn: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  signupLinkWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.medium,
  },
  signupLink: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
  },
});
export default LoginScreen;
