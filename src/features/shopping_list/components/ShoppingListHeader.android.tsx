import React, { useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/core/theme/ThemeContext';
import { ShoppingListHeaderProps } from './ShoppingListHeader.types';

interface HeaderIconButtonProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  onPress: () => void;
  accessibilityLabel: string;
}

const HeaderIconButton: React.FC<HeaderIconButtonProps> = ({
  icon,
  iconColor,
  onPress,
  accessibilityLabel,
}) => {
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
          styles.iconButton,
          {
            backgroundColor: colors.surfaceVariant,
            borderColor: colors.border,
          },
        ]}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </Pressable>
    </Animated.View>
  );
};

export const ShoppingListHeader: React.FC<ShoppingListHeaderProps> = ({ title, onClear }) => {
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
        <Text numberOfLines={1} style={[styles.screenTitle, { color: colors.textPrimary }]}>
          {title}
        </Text>

        {onClear && (
          <HeaderIconButton
            icon="trash-outline"
            iconColor={colors.error}
            onPress={onClear}
            accessibilityLabel={t('clearShoppingList')}
          />
        )}
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
    fontSize: 22,
    fontWeight: '700',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
});
