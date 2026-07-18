import { typography } from './typography';

/** Shared text styles for content placed inside BentoCard. */
export const bentoText = {
  label: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  value: {
    fontFamily: typography.fontFamily,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
  },
};

/** Screen-level container background, per bento spec. */
export const bentoScreenBg = (isDark) => (isDark ? '#0A0A0A' : '#F5F5F7');
