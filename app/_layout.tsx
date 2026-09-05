import { useMemo } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import {
  ThemeProvider as NavThemeProvider,
  DarkTheme,
  DefaultTheme,
} from 'expo-router/react-navigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useAppTheme } from '@/core/theme/ThemeContext';
import '@/locales/i18n';

function RootLayoutNav() {
  const { colors, isDark } = useAppTheme();

  const navTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      dark: isDark,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.card,
        text: colors.textPrimary,
        border: colors.border,
        notification: colors.primary,
      },
    };
  }, [isDark, colors]);

  return (
    <NavThemeProvider value={navTheme}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'default',
            headerBackButtonDisplayMode: 'minimal',
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false, title: '' }} />
          <Stack.Screen name="wishlist" />
          <Stack.Screen name="product-details" />
          <Stack.Screen name="checkout" />
          <Stack.Screen name="history" />
          <Stack.Screen name="history-details" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="sign-in" options={{ presentation: 'modal' }} />
          <Stack.Screen name="sign-up" options={{ presentation: 'modal' }} />
        </Stack>
      </View>
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
