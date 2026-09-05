import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/core/theme/ThemeContext';
import { ShoppingHistoryItem, getHistoryItemLocalizedName } from '../types';
import { CurrencyFormatter } from '@/core/utils/currencyFormatter';

interface HistoryItemTileProps {
  item: ShoppingHistoryItem;
}

export const HistoryItemTile: React.FC<HistoryItemTileProps> = ({ item }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();

  const localizedName = getHistoryItemLocalizedName(item, i18n.language);
  const total = item.priceAtPurchase * item.quantity;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.detailsContainer}>
        <Text numberOfLines={2} style={[styles.title, { color: colors.textPrimary }]}>
          {localizedName}
        </Text>
        <Text style={[styles.quantity, { color: colors.textSecondary }]}>
          {t('productQuantityInList', { quantity: item.quantity })} @{' '}
          {CurrencyFormatter.format(item.priceAtPurchase)} €
        </Text>
      </View>

      <Text style={[styles.totalPrice, { color: colors.textPrimary }]}>
        {CurrencyFormatter.format(total)} €
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
  },
  detailsContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  quantity: {
    fontSize: 13,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
});
