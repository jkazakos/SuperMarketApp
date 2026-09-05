import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, ThemeColors } from '../constants/colors';
import { useSettingsStore, ThemeMode } from '@/features/settings/stores/useSettingsStore';

interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  isDark: false,
  themeMode: 'system',
  setThemeMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const themeMode = useSettingsStore((s) => s.themeMode);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);

  const isDark = useMemo(() => {
    if (themeMode === 'dark') return true;
    if (themeMode === 'light') return false;
    return systemScheme === 'dark';
  }, [themeMode, systemScheme]);

  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);

  const value = useMemo(
    () => ({ colors, isDark, themeMode, setThemeMode }),
    [colors, isDark, themeMode, setThemeMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = () => useContext(ThemeContext);
