export const Colors = {
  // Primary Brand (Electric Indigo)
  primary: '#4F46E5',
  primaryDark: '#6366F1',
  primaryLight: '#818CF8',
  primaryContainerLight: '#EEF2FF',
  primaryContainerDark: '#1E1B4B',

  // Secondary / Accent (Energetic Coral)
  secondary: '#FF4757',
  secondaryDark: '#FF6B81',
  secondaryLight: '#FF8595',
  secondaryContainerLight: '#FFF1F2',
  secondaryContainerDark: '#4C1D24',

  // Semantics & Status
  discountOrange: '#F59E0B',
  linkColor: '#4F46E5',
  successGreen: '#10B981',
  successGreenDark: '#34D399',
  errorRed: '#EF4444',
  errorRedDark: '#F87171',

  // Light Mode Surfaces & Text
  backgroundLight: '#F8FAFC',
  cardLight: '#FFFFFF',
  surfaceVariantLight: '#F1F5F9',
  borderLight: '#E2E8F0',
  textPrimaryLight: '#0F172A',
  textSecondaryLight: '#64748B',

  // Dark Mode Surfaces & Text
  backgroundDark: '#0B0F19',
  cardDark: '#161E2E',
  surfaceVariantDark: '#1E293B',
  borderDark: '#334155',
  textPrimaryDark: '#F8FAFC',
  textSecondaryDark: '#94A3B8',
};

export type ThemeColors = {
  primary: string;
  primaryContainer: string;
  secondary: string;
  secondaryContainer: string;
  background: string;
  card: string;
  surfaceVariant: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  error: string;
  success: string;
  discount: string;
  isDark: boolean;
};

export const lightColors: ThemeColors = {
  primary: Colors.primary,
  primaryContainer: Colors.primaryContainerLight,
  secondary: Colors.secondary,
  secondaryContainer: Colors.secondaryContainerLight,
  background: Colors.backgroundLight,
  card: Colors.cardLight,
  surfaceVariant: Colors.surfaceVariantLight,
  border: Colors.borderLight,
  textPrimary: Colors.textPrimaryLight,
  textSecondary: Colors.textSecondaryLight,
  error: Colors.errorRed,
  success: Colors.successGreen,
  discount: Colors.discountOrange,
  isDark: false,
};

export const darkColors: ThemeColors = {
  primary: Colors.primaryDark,
  primaryContainer: Colors.primaryContainerDark,
  secondary: Colors.secondaryDark,
  secondaryContainer: Colors.secondaryContainerDark,
  background: Colors.backgroundDark,
  card: Colors.cardDark,
  surfaceVariant: Colors.surfaceVariantDark,
  border: Colors.borderDark,
  textPrimary: Colors.textPrimaryDark,
  textSecondary: Colors.textSecondaryDark,
  error: Colors.errorRedDark,
  success: Colors.successGreenDark,
  discount: Colors.discountOrange,
  isDark: true,
};
