import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/core/theme/ThemeContext';
import { ProductDetailsHeaderProps } from './ProductDetailsHeader.types';

export const ProductDetailsHeader: React.FC<ProductDetailsHeaderProps> = ({
  title,
  onBack,
  isInWishlist = false,
  onToggleWishlist,
}) => {
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
    <>
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
                    accessibilityLabel="Back"
                  >
                    <Ionicons name="chevron-back" size={26} color={colors.primary} />
                  </TouchableOpacity>
                )
              : undefined,
        }}
      />
      {onToggleWishlist && (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            icon={isInWishlist ? 'heart.fill' : 'heart'}
            tintColor={isInWishlist ? colors.secondary : colors.textPrimary}
            separateBackground
            onPress={onToggleWishlist}
            accessibilityLabel={
              isInWishlist
                ? t('removeFromWishlist') || 'Remove from wishlist'
                : t('addToWishlist') || 'Add to wishlist'
            }
          />
        </Stack.Toolbar>
      )}
    </>
  );
};
