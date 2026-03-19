/**
 * PKN Portal Design System — Colors
 * Brand-aligned palette with semantic tokens for status badges.
 */

export const colors = {
  // Brand
  brand: {
    primary: '#208AEF',
    primaryDark: '#1A6FBF',
    primaryLight: '#4DA3F5',
    accent: '#FF6B35',
  },

  // Backgrounds
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F7FA',
    tertiary: '#EDF1F7',
    dark: '#0D1B2A',
    card: '#FFFFFF',
  },

  // Text
  text: {
    primary: '#1A1A2E',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
    link: '#208AEF',
  },

  // Status / Badge semantic colors
  status: {
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
    neutral: '#9CA3AF',
    neutralLight: '#F3F4F6',
  },

  // UI Elements
  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
    focus: '#208AEF',
  },

  // Glassmorphism (iOS)
  glass: {
    background: 'rgba(255, 255, 255, 0.75)',
    backgroundDark: 'rgba(13, 27, 42, 0.65)',
    border: 'rgba(255, 255, 255, 0.3)',
  },

  // Overlay
  overlay: {
    light: 'rgba(0, 0, 0, 0.3)',
    medium: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgba(0, 0, 0, 0.7)',
  },
} as const;

export type Colors = typeof colors;
