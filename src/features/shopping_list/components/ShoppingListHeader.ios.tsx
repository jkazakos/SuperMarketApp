import React from 'react';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/core/theme/ThemeContext';
import { ShoppingListHeaderProps } from './ShoppingListHeader.types';

export const ShoppingListHeader: React.FC<ShoppingListHeaderProps> = ({
  title,
  onClear,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <>
      <Stack.Screen
        options={{
          title,
          headerTitleStyle: {
            color: colors.textPrimary,
            fontSize: 18,
            fontWeight: '700',
          },
        }}
      />
      {onClear && (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            icon="trash"
            separateBackground
            onPress={onClear}
            accessibilityLabel={t('clearShoppingList')}
          />
        </Stack.Toolbar>
      )}
    </>
  );
};
