import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions, SafeAreaView, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import useTheme from '../../hooks/useTheme';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    icon: 'chat-processing-outline',
    title: 'Chat to Log',
    description: 'Just type what you spent like "swiggy ₹500" or say it out loud. XpenZ AI registers it with the speed of thought.',
    color: '#3730a3',
  },
  {
    id: 2,
    icon: 'text-box-search-outline',
    title: 'AI Reads Bills',
    description: 'Snap a picture of any invoice or receipt. Our intelligent OCR parsing engine extracts amounts, vendors, and dates in seconds.',
    color: '#4f46e5',
  },
  {
    id: 3,
    icon: 'chart-bell-curve-cumulative',
    title: 'Real-time Budgets',
    description: 'Set category thresholds and stay within boundaries. Get instantly warned before you exceed your company budget limits.',
    color: '#6366f1',
  },
];

export const OnboardingScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const scrollViewRef = useRef(null);

  const handleMomentumScrollEnd = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / SCREEN_WIDTH);
    setCurrentSlideIndex(index);
  };

  const handleNext = () => {
    if (currentSlideIndex < SLIDES.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (currentSlideIndex + 1) * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentSlideIndex(currentSlideIndex + 1);
    } else {
      handleSkip();
    }
  };

  const handleSkip = async () => {
    await SecureStore.setItemAsync('onboarding_complete', 'true');
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header Row with Skip button */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.7} onPress={handleSkip}>
          <Text style={[styles.skipText, { color: colors.primary }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal paginated slides slider */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        style={styles.slidesWrapper}
      >
        {SLIDES.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primaryContainer }]}>
              <MaterialCommunityIcons name={slide.icon} size={84} color={colors.primary} />
            </View>
            <Text style={[styles.slideTitle, { color: colors.text }]}>{slide.title}</Text>
            <Text style={[styles.slideDescription, { color: colors.textSecondary }]}>
              {slide.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Footer Controls containing Dots and Button */}
      <View style={styles.footer}>
        {/* Progress dots */}
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, index) => (
            <View
              key={`dot-${index}`}
              style={[
                styles.dot,
                {
                  backgroundColor: currentSlideIndex === index ? colors.primary : colors.border,
                  width: currentSlideIndex === index ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Action Button */}
        <Button
          title={currentSlideIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          variant="primary"
          style={styles.actionBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 50,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  skipText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  slidesWrapper: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  slideTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  slideDescription: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    textAlign: 'center',
    lineHeight: typography.lineHeights.sm + 2,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  actionBtn: {
    width: '100%',
  },
});
export default OnboardingScreen;
