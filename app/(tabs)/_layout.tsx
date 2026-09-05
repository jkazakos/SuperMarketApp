import React from 'react';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/core/theme/ThemeContext';
import { useCartStore } from '@/features/shopping_list/stores/useCartStore';

export default function TabLayout() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const cartCount = useCartStore((s) => s.cartItems.length);

  return (
    <NativeTabs minimizeBehavior="onScrollDown" tintColor={colors.primary}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="storefront.fill" md="storefront" />
        <NativeTabs.Trigger.Label>
          {t('titleActivityProducts')}
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="shopping-list">
        <NativeTabs.Trigger.Icon sf="cart.fill" md="shopping_cart" />
        <NativeTabs.Trigger.Label>{t('shoppingList')}</NativeTabs.Trigger.Label>
        {cartCount > 0 && (
          <NativeTabs.Trigger.Badge>
            {cartCount > 99 ? '99+' : `${cartCount}`}
          </NativeTabs.Trigger.Badge>
        )}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(profile)">
        <NativeTabs.Trigger.Icon sf="person.fill" md="person" />
        <NativeTabs.Trigger.Label>{t('userProfile')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
