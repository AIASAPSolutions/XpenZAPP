import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import useTheme from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

export const OtpVerificationScreen = ({ navigation, route }) => {
  const { email } = route.params;
  const { colors } = useTheme();
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const resendOtp = useAuthStore((s) => s.resendOtp);
  const loading = useAuthStore((s) => s.loading);
  const showToast = useUiStore((s) => s.showToast);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resending, setResending] = useState(false);
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text.slice(-1);
    setOtp(newOtp);
    if (text && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      showToast('Please enter the complete 6-digit OTP', 'error');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result = await verifyOtp(email, otpString);
    if (result.success) {
      showToast('Email verified! Welcome to XpenZtrack.', 'success');
    } else {
      showToast(result.error, 'error');
    }
  };

  const handleResend = async () => {
    setResending(true);
    const result = await resendOtp(email);
    setResending(false);
    if (result.success) {
      showToast('New OTP sent to your email.', 'info');
    } else {
      showToast(result.error, 'error');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.inner}>

        <View style={[styles.iconBox, { backgroundColor: colors.primaryContainer }]}>
          <Text style={[styles.iconText, { color: colors.primary }]}>✉️</Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Verify Your Email</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Enter the 6-digit OTP sent to{'\n'}
          <Text style={{ color: colors.primary, fontWeight: typography.weights.bold }}>{email}</Text>
        </Text>

        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(r) => (inputs.current[i] = r)}
              style={[
                styles.otpInput,
                {
                  borderColor: digit ? colors.primary : colors.border,
                  backgroundColor: colors.card,
                  color: colors.text,
                }
              ]}
              value={digit}
              onChangeText={(t) => handleChange(t, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Verify OTP</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleResend}
          disabled={resending}
          style={styles.resendBtn}
          activeOpacity={0.7}
        >
          <Text style={[styles.resendText, { color: colors.primary }]}>
            {resending ? 'Sending...' : "Didn't receive it? Resend OTP"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={[styles.backText, { color: colors.textSecondary }]}>
            Back to Login
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: spacing.xl, justifyContent: 'center', alignItems: 'center' },
  iconBox: {
    width: 72, height: 72, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl,
  },
  iconText: { fontSize: 32 },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm + 1,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xxl,
  },
  otpRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  otpInput: {
    width: 48, height: 56,
    borderWidth: 2,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
  },
  button: {
    width: '100%', borderRadius: 12,
    paddingVertical: spacing.md + 2,
    alignItems: 'center', marginBottom: spacing.lg,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: '#fff',
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  resendBtn: { paddingVertical: spacing.sm, marginBottom: spacing.sm },
  resendText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.semibold,
    textDecorationLine: 'underline',
  },
  backBtn: { paddingVertical: spacing.sm },
  backText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
});

export default OtpVerificationScreen;