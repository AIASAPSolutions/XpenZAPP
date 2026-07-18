import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, Animated, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/spacing';
import { CONFIG } from '../../constants/config';

export const SplashScreen = ({ navigation }) => {
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Custom logo scale and fade sequences
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(async () => {
      try {
        const [onboardingDone, token] = await Promise.all([
          SecureStore.getItemAsync('onboarding_complete'),
          SecureStore.getItemAsync('user_token'),
        ]);
        if (token) {
          navigation.replace('Main');
          return;
        }
        navigation.replace(onboardingDone === 'true' ? 'Login' : 'Onboarding');
      } catch (e) {
        console.warn('Splash error:', e);
        navigation.replace('Login');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation, scaleAnim, fadeAnim]);

  return (
    <LinearGradient
      colors={[colors.primary, colors.secondary]}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoInner}>
          <Text style={styles.logoText}>XP</Text>
        </View>
        <Text style={styles.appName}>{CONFIG.APP_NAME}</Text>
        <Text style={styles.tagline}>{CONFIG.TAGLINE}</Text>
      </Animated.View>
      
      <View style={styles.footer}>
        <Text style={styles.companyText}>Powered by {CONFIG.COMPANY}</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
    marginBottom: spacing.lg,
  },
  logoText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.huge,
    fontWeight: typography.weights.black,
    color: colors.primary,
  },
  appName: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xxl + 4,
    fontWeight: typography.weights.bold,
    color: '#ffffff',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm + 1,
    color: colors.accent,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 48,
  },
  companyText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: typography.weights.semibold,
  },
});
export default SplashScreen;
