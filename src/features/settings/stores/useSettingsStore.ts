import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/locales/i18n';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AppLanguage = 'en' | 'el';

interface SettingsState {
  themeMode: ThemeMode;
  language: AppLanguage;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (lang: AppLanguage) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      language: (i18n.language === 'el' ? 'el' : 'en') as AppLanguage,
      setThemeMode: (themeMode) => set({ themeMode }),
      setLanguage: (language) => {
        i18n.changeLanguage(language);
        set({ language });
      },
    }),
    {
      name: 'supermarket-settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          i18n.changeLanguage(state.language);
        }
      },
    }
  )
);
