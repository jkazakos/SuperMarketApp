import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/core/theme/ThemeContext';
import { SettingsHeaderProps } from './SettingsHeader.types';

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({ title, onBack }) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      if (onBack) {
        onBack();
      } else {
        router.back();
      }
    } else {
      router.replace('/(tabs)/(products)');
    }
  };

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
                  onPress={handleBack}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                  style={{ marginRight: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel={t('backButton') || 'Back'}
                >
                  <Ionicons name="chevron-back" size={26} color={colors.primary} />
                </TouchableOpacity>
              )
            : undefined,
      }}
    />
  );
};
