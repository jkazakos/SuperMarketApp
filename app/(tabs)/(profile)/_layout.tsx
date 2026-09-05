import React from 'react';
import { Stack } from 'expo-router/stack';
import { Platform } from 'react-native';
import { useAppTheme } from '@/core/theme/ThemeContext';

export default function ProfileStackLayout() {
  const { colors } = useAppTheme();
  const isIOS = Platform.OS === 'ios';

  return (
    <Stack
      screenOptions={{
        headerShown: isIOS,
        headerLargeTitle: false,
        headerTransparent: true,
        headerShadowVisible: false,
        headerTintColor: colors.primary,
        headerTitleStyle: {
          color: colors.textPrimary,
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
