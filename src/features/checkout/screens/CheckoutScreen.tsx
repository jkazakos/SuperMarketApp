import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/core/theme/ThemeContext';
import { useCartStore } from '@/features/shopping_list/stores/useCartStore';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { CheckoutService } from '../services/checkoutService';
import { CheckoutItemTile } from '../components/CheckoutItemTile';
import { CheckoutHeader } from '../components/CheckoutHeader';
import { CurrencyFormatter } from '@/core/utils/currencyFormatter';
import { RootStackScreenProps } from '@/navigation/types';

export const CheckoutScreen: React.FC<RootStackScreenProps<'Checkout'>> = ({
  navigation,
}) => {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const user = useAuthStore((s) => s.user);
  const cartItems = useCartStore((s) => s.cartItems);
  const totalAmount = useCartStore((s) => s.totalAmount);
  const totalQuantity = useCartStore((s) => s.totalQuantity);

  const [processing, setProcessing] = useState(false);

  const handlePurchase = async () => {
    if (!user) return;
    if (cartItems.length === 0) return;

    setProcessing(true);

    const result = await CheckoutService.processPurchase({
      userId: user.uid,
      items: cartItems,
      totalAmount,
      locale: i18n.language,
    });

    setProcessing(false);

    if (result.success) {
      Alert.alert(t('appName'), t('purchaseSuccessful'), [
        {
          text: 'OK',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: '(tabs)' }],
            });
          },
        },
      ]);
    } else if (result.outOfStockProduct) {
      Alert.alert(
        t('stockIssuesTitle'),
        t('outOfStockItem', { item: result.outOfStockProduct })
      );
    } else {
      Alert.alert(t('appName'), t('purchaseFailed'));
    }
  };

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
      <CheckoutHeader title={t('checkout')} onBack={handleBack} />

      {/* Items List */}
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        data={cartItems}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={{ paddingBottom: 160 }}
        renderItem={({ item }) => <CheckoutItemTile item={item} />}
        ListFooterComponent={
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                {t('itemCount', { count: totalQuantity })}
              </Text>
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                {CurrencyFormatter.format(totalAmount)} €
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>
                Total
              </Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                {CurrencyFormatter.format(totalAmount)} €
              </Text>
            </View>
          </View>
        }
      />

      {/* Bottom Actions Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: colors.border }]}
          onPress={() => navigation.goBack()}
          disabled={processing}
          activeOpacity={0.7}
        >
          <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
            {t('cancelText')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.purchaseButton,
            {
              backgroundColor: colors.primary,
              opacity: processing ? 0.7 : 1,
            },
          ]}
          onPress={handlePurchase}
          disabled={processing || cartItems.length === 0}
          activeOpacity={0.8}
        >
          {processing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.purchaseText}>
              {t('purchaseWithPrice', {
                price: CurrencyFormatter.format(totalAmount),
              })}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.15)',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
  purchaseButton: {
    flex: 2,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchaseText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
