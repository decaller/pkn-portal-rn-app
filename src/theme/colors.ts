/**
 * PKN Portal Design System — Colors
 * Brand-aligned palette with semantic tokens for light and dark modes.
 */

export const light = {
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
    card: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.4)',
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
    border: 'rgba(255, 255, 255, 0.3)',
  },
} as const;

export const dark = {
  // Brand
  brand: {
    primary: '#3B9EFF',
    primaryDark: '#208AEF',
    primaryLight: '#6DBBFF',
    accent: '#FF8459',
  },

  // Backgrounds
  background: {
    primary: '#0D1117',
    secondary: '#161B22',
    tertiary: '#21262D',
    card: '#1C2128',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },

  // Text
  text: {
    primary: '#F0F6FC',
    secondary: '#8B949E',
    tertiary: '#484F58',
    inverse: '#FFFFFF',
    link: '#58A6FF',
  },

  // Status / Badge
  status: {
    success: '#238636',
    successLight: 'rgba(35, 134, 54, 0.15)',
    warning: '#D29922',
    warningLight: 'rgba(210, 153, 34, 0.15)',
    danger: '#F85149',
    dangerLight: 'rgba(248, 81, 73, 0.15)',
    info: '#388BFD',
    infoLight: 'rgba(56, 139, 253, 0.15)',
    neutral: '#8B949E',
    neutralLight: 'rgba(139, 148, 158, 0.15)',
  },

  // UI Elements
  border: {
    light: '#30363D',
    medium: '#484F58',
    focus: '#58A6FF',
  },

  // Glassmorphism
  glass: {
    background: 'rgba(22, 27, 34, 0.75)',
    border: 'rgba(240, 246, 252, 0.1)',
  },
} as const;

export type Colors = typeof light;
export const colors = light; // Default/backward compatibility

