import { Platform } from 'react-native';

// Original app colors (unchanged) -- used by the existing screens.
export const COLORS = {
  primary: '#2E7D5B',
  background: '#F7F6F2',
  card: '#FFFFFF',
  textPrimary: '#14181F',
  textSecondary: '#5D6B7A',
  textOnPrimary: '#FFFFFF',
  surface: '#EFF3F0',
  border: '#DADFE3',
  shadow: '#14181F',
  warning: '#C97A2B',
  success: '#2E7D5B',
  danger: '#B3261E',
} as const;

// "Modern Campus Tech" palette: deep navy, electric blue + cyan accents,
// glass-style surfaces. Use this on screens that get the new look.
// Aurora design system — shared across every app screen.
// PRESENCE STUDIO — editorial graphite, luminous citrus, and mineral aqua.
// Visual tokens only. Supabase and business logic remain unchanged.
export const CAMPUS = {
  bg: '#111A24',
  bgDeep: '#172330',
  surface: 'rgba(238,231,217,0.075)',
  surfaceStrong: 'rgba(238,231,217,0.14)',
  inputBg: 'rgba(240,237,230,0.085)',
  border: 'rgba(227,223,215,0.19)',
  primary: '#EFC5AB',
  primaryDeep: '#B57D69',
  accent: '#EFC5AB',
  mint: '#A5C8BE',
  text: '#FAF7F0',
  textMuted: '#C5CBC8',
  textFaint: '#8D9A9F',
  danger: '#FDAFA4',
  dangerBg: 'rgba(253,175,164,0.13)',
  dangerBorder: 'rgba(253,175,164,0.38)',
  mono: Platform.select({
    ios: 'Menlo', android: 'monospace',
    default: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  }) as string,
} as const;