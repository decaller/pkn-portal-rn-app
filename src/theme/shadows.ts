/**
 * PKN Portal Design System — Shadows & Elevation
 * iOS uses shadow* properties; Android uses elevation.
 * Both should be defined for cross-platform depth.
 */
import { Platform, ViewStyle } from 'react-native';

type ShadowLevel = ViewStyle;

export const shadows: Record<'sm' | 'md' | 'lg' | 'xl', ShadowLevel> = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }) as ShadowLevel,

  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }) as ShadowLevel,

  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }) as ShadowLevel,

  xl: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
    },
    android: {
      elevation: 12,
    },
    default: {},
  }) as ShadowLevel,
};

export type Shadows = typeof shadows;
