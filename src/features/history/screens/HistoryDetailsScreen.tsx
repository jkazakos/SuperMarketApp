import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/core/theme/ThemeContext';
import { HistoryItemTile } from '../components/HistoryItemTile';
import { HistoryHeader } from '../components/HistoryHeader';
import { DateFormatter } from '@/core/utils/dateFormatter';
import { CurrencyFormatter } from '@/core/utils/currencyFormatter';
import { RootStackScreenProps } from '@/navigation/types';

export const HistoryDetailsScreen: React.FC<
  RootStackScreenProps<'HistoryDetails'>
> = ({ route, navigation }) => {
  const history = route?.params?.history;
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  if (!history || typeof history !== 'object' || !Array.isArray(history.items)) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
            paddingTop: Math.max(insets.top, 16),
          },
        ]}
      >
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color={colors.textSecondary}
        />
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 18,
            fontWeight: '600',
            marginTop: 16,
            textAlign: 'center',
          }}
        >
          {t('historyNotFound', 'Order details not found')}
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
            marginTop: 20,
          }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>
            {t('goBack', 'Go Back')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const dateStr = history.datePurchased
    ? DateFormatter.formatShortDate(history.datePurchased, i18n.language)
    : t('unknownDate');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Platform-Specific Native Header (iOS UIKit navigation vs Android Material 3 header) */}
      <HistoryHeader
        title={t('shoppingHistory')}
        onBack={() => navigation.goBack()}
      />

      {/* Date & Total Overview */}
      <View
        style={[
          styles.overviewCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View>
          <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>
            Date of Purchase
          </Text>
          <Text style={[styles.dateValue, { color: colors.textPrimary }]}>
            {dateStr}
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>
            Total Paid
          </Text>
          <Text style={[styles.totalAmount, { color: colors.primary }]}>
            {CurrencyFormatter.format(history.totalAmount)} €
          </Text>
        </View>
      </View>

      {/* Items Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          {t('itemCount', { count: history.items.length })}
        </Text>
      </View>

      {/* Items List */}
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        data={history.items}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom + 20, 40),
        }}
        renderItem={({ item }) => <HistoryItemTile item={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overviewCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '800',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
});
