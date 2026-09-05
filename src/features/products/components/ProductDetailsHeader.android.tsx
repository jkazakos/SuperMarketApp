import React, { useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/core/theme/ThemeContext';
import { ProductDetailsHeaderProps } from './ProductDetailsHeader.types';

interface HeaderButtonProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  iconSize?: number;
  onPress: () => void;
  accessibilityLabel: string;
}

const HeaderButton: React.FC<HeaderButtonProps> = ({
  icon,
  iconColor,
  iconSize = 22,
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
        <Ionicons name={icon} size={iconSize} color={iconColor} />
      </Pressable>
    </Animated.View>
  );
};

export const ProductDetailsHeader: React.FC<ProductDetailsHeaderProps> = ({
  title,
  onBack,
  isInWishlist = false,
  onToggleWishlist,
}) => {
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
          <HeaderButton
            icon="arrow-back"
            iconColor={colors.textPrimary}
            iconSize={22}
            onPress={onBack}
            accessibilityLabel={t('backButton') || 'Back'}
          />
        ) : (
          <View style={styles.placeholder} />
        )}

        <Text numberOfLines={1} style={[styles.screenTitle, { color: colors.textPrimary }]}>
          {title}
        </Text>

        {onToggleWishlist ? (
          <HeaderButton
            icon={isInWishlist ? 'heart' : 'heart-outline'}
            iconColor={isInWishlist ? colors.secondary : colors.textPrimary}
            iconSize={22}
            onPress={onToggleWishlist}
            accessibilityLabel={
              isInWishlist
                ? t('removeFromWishlist') || 'Remove from wishlist'
                : t('addToWishlist') || 'Add to wishlist'
            }
          />
        ) : (
          <View style={styles.placeholder} />
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
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: 8,
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
  placeholder: {
    width: 40,
  },
});
