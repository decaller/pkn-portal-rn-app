/**
 * PKN Portal Design System — Typography
 * Uses system fonts (SF Pro on iOS, Roboto on Android) by default.
 * fontFamily left undefined to inherit platform defaults per Native Look and Feel Guide.
 */
import { Platform, TextStyle } from 'react-native';

type TypographyScale = {
  largeTitle: TextStyle;
  title1: TextStyle;
  title2: TextStyle;
  title3: TextStyle;
  headline: TextStyle;
  body: TextStyle;
  callout: TextStyle;
  subhead: TextStyle;
  footnote: TextStyle;
  caption1: TextStyle;
  caption2: TextStyle;
};

export const typography: TypographyScale = {
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 41,
    letterSpacing: Platform.select({ ios: 0.37, android: 0 }),
  },
  title1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: Platform.select({ ios: 0.36, android: 0 }),
  },
  title2: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: Platform.select({ ios: 0.35, android: 0 }),
  },
  title3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 25,
    letterSpacing: Platform.select({ ios: 0.38, android: 0.15 }),
  },
  headline: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
    letterSpacing: Platform.select({ ios: -0.41, android: 0.15 }),
  },
  body: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 22,
    letterSpacing: Platform.select({ ios: -0.41, android: 0.5 }),
  },
  callout: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 21,
    letterSpacing: Platform.select({ ios: -0.32, android: 0.25 }),
  },
  subhead: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: Platform.select({ ios: -0.24, android: 0.1 }),
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    letterSpacing: Platform.select({ ios: -0.08, android: 0.4 }),
  },
  caption1: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 13,
    letterSpacing: Platform.select({ ios: 0.07, android: 0.5 }),
  },
};

export type Typography = typeof typography;
