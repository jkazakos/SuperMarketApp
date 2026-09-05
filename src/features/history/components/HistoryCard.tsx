import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/core/theme/ThemeContext';
import { ShoppingHistory, getHistoryItemLocalizedName } from '../types';
import { DateFormatter } from '@/core/utils/dateFormatter';
import { CurrencyFormatter } from '@/core/utils/currencyFormatter';

interface HistoryCardProps {
  history: ShoppingHistory;
  onPress: () => void;
}

export const HistoryCard: React.FC<HistoryCardProps> = ({ history, onPress }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();

  const dateStr = history.datePurchased
    ? DateFormatter.formatShortDate(history.datePurchased, i18n.language)
    : t('unknownDate');

  const names = history.items.map((item) =>
    getHistoryItemLocalizedName(item, i18n.language)
  );

  let preview = '';
  if (names.length > 2) {
    const firstTwo = names.slice(0, 2).join(', ');
    const moreCount = names.length - 2;
    preview = t('previewItemsWithMore', {
      items: firstTwo,
      more: t('previewMore', { count: moreCount }),
    });
  } else {
    preview = t('previewItems', { items: names.join(', ') });
  }

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${t('shoppingHistory')}: ${dateStr}, ${CurrencyFormatter.format(history.totalAmount)} €, ${t('itemCount', { count: history.items.length })}, ${preview}`}
    >
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {dateStr}
          </Text>
          <Text style={[styles.totalAmount, { color: colors.primary }]}>
            {CurrencyFormatter.format(history.totalAmount)} €
          </Text>
        </View>

        <Text
          numberOfLines={2}
          style={[styles.previewText, { color: colors.textPrimary }]}
        >
          {preview}
        </Text>

        <View style={styles.bottomRow}>
          <Text style={[styles.itemCount, { color: colors.textSecondary }]}>
            {t('itemCount', { count: history.items.length })}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
  previewText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  itemCount: {
    fontSize: 13,
  },
});
