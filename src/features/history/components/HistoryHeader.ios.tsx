import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/core/theme/ThemeContext';
import { HistoryHeaderProps } from './HistoryHeader.types';

export const HistoryHeader: React.FC<HistoryHeaderProps> = ({
  title,
  onBack,
  onClear,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const router = useRouter();

  return (
    <Stack.Screen
      options={{
        headerShown: true,
        title,
        headerTintColor: colors.primary,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        headerBackTitle: '',
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          color: colors.textPrimary,
          fontSize: 20,
          fontWeight: '700',
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
        headerLeft:
          onBack && !router.canGoBack()
            ? () => (
                <TouchableOpacity
                  onPress={onBack}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                  style={{ marginRight: 8 }}
                >
                  <Ionicons name="chevron-back" size={26} color={colors.primary} />
                </TouchableOpacity>
              )
            : undefined,
        headerRight: onClear
          ? () => (
              <TouchableOpacity
                onPress={onClear}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={t('clearShoppingHistory')}
              >
                <Ionicons name="trash-outline" size={22} color={colors.error} />
              </TouchableOpacity>
            )
          : undefined,
      }}
    />
  );
};
