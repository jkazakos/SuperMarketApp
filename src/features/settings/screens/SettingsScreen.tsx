import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/core/theme/ThemeContext';
import {
  useSettingsStore,
  ThemeMode,
  AppLanguage,
} from '../stores/useSettingsStore';
import { SettingsHeader } from '../components/SettingsHeader';
import { RootStackScreenProps } from '@/navigation/types';

export const SettingsScreen: React.FC<RootStackScreenProps<'Settings'>> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const { colors, themeMode, setThemeMode } = useAppTheme();

  const currentLanguage = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  const themeOptions: {
    mode: ThemeMode;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    { mode: 'light', label: t('themeLight'), icon: 'sunny-outline' },
    { mode: 'dark', label: t('themeDark'), icon: 'moon-outline' },
    { mode: 'system', label: t('themeSystem'), icon: 'phone-portrait-outline' },
  ];

  const languageOptions: { lang: AppLanguage; label: string; flag: string }[] = [
    { lang: 'en', label: t('english'), flag: '🇬🇧' },
    { lang: 'el', label: t('greek'), flag: '🇬🇷' },
  ];

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      (navigation as any).navigate('(tabs)', { screen: '(products)' });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Platform-Specific Native Header (iOS UIKit navigation vs Android Material 3 header) */}
      <SettingsHeader title={t('settings')} onBack={handleBack} />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          {t('appearance').toUpperCase()}
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          {themeOptions.map((opt, index) => {
            const isSelected = themeMode === opt.mode;
            return (
              <React.Fragment key={opt.mode}>
                {index > 0 && (
                  <View
                    style={[styles.divider, { backgroundColor: colors.border }]}
                  />
                )}
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => setThemeMode(opt.mode)}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={opt.label}
                >
                  <View style={styles.optionLeft}>
                    <Ionicons
                      name={opt.icon}
                      size={22}
                      color={isSelected ? colors.primary : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          color: isSelected ? colors.primary : colors.textPrimary,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </View>

        {/* Language Section */}
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.textSecondary, marginTop: 28 },
          ]}
        >
          {t('language').toUpperCase()}
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          {languageOptions.map((opt, index) => {
            const isSelected = currentLanguage === opt.lang;
            return (
              <React.Fragment key={opt.lang}>
                {index > 0 && (
                  <View
                    style={[styles.divider, { backgroundColor: colors.border }]}
                  />
                )}
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => setLanguage(opt.lang)}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={opt.label}
                >
                  <View style={styles.optionLeft}>
                    <Text style={{ fontSize: 20 }}>{opt.flag}</Text>
                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          color: isSelected ? colors.primary : colors.textPrimary,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  optionLabel: {
    fontSize: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 50,
  },
});
