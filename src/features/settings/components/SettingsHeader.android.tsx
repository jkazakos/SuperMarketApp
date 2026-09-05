import React, { useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/core/theme/ThemeContext';
import { SettingsHeaderProps } from './SettingsHeader.types';

interface BackButtonProps {
  onPress: () => void;
  accessibilityLabel: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onPress, accessibilityLabel }) => {
  const { colors } = useAppTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
      bounciness: 5,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.backButton,
          {
            backgroundColor: colors.surfaceVariant,
            borderColor: colors.border,
          },
        ]}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
      </Pressable>
    </Animated.View>
  );
};

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({ title, onBack }) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.androidSolidHeader,
        {
          backgroundColor: colors.background,
          paddingTop: Math.max(insets.top, 12),
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.titleRow}>
        {onBack ? (
          <BackButton
            onPress={onBack}
            accessibilityLabel={t('backButton') || 'Back'}
          />
        ) : (
          <View style={styles.placeholder} />
        )}

        <Text
          numberOfLines={1}
          style={[styles.screenTitle, { color: colors.textPrimary }]}
        >
          {title}
        </Text>

        <View style={styles.placeholder} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  androidSolidHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  screenTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  placeholder: {
    width: 40,
  },
});
