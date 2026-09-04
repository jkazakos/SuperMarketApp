import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/core/theme/ThemeContext';
import { useCartStore } from '../stores/useCartStore';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { ShoppingListTile } from '../components/ShoppingListTile';
import { ConfirmDialog } from '@/core/components/ConfirmDialog';
import { EmptyStateView } from '@/core/components/EmptyStateView';
import { CustomSnackBar } from '@/core/components/CustomSnackBar';
import { CurrencyFormatter } from '@/core/utils/currencyFormatter';
import { MainTabScreenProps } from '@/navigation/types';

export const ShoppingListScreen: React.FC<MainTabScreenProps<'ShoppingList'>> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const user = useAuthStore((s) => s.user);
  const cartItems = useCartStore((s) => s.cartItems);
  const totalAmount = useCartStore((s) => s.totalAmount);
  const totalQuantity = useCartStore((s) => s.totalQuantity);

  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  const [clearDialogVisible, setClearDialogVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);

  const handleClear = async () => {
    await clearCart();
    setClearDialogVisible(false);
    setSnackMessage(t('shoppingListCleared'));
    setSnackVisible(true);
  };

  const handleCheckoutPress = () => {
    (navigation as any).navigate('checkout');
  };

  if (!user) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            paddingTop: Math.max(insets.top, 16),
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {t('shoppingList')}
        </Text>
        <EmptyStateView message={t('guestMessage')} icon="lock-closed-outline" />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: Math.max(insets.top, 16),
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {t('shoppingList')}
        </Text>

        {cartItems.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setClearDialogVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* Cart Items List */}
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={{
          paddingBottom: cartItems.length > 0 ? 170 : 110,
          flexGrow: 1,
        }}
        renderItem={({ item }) => (
          <ShoppingListTile
            item={item}
            onPress={() =>
              (navigation as any).navigate('product-details', {
                product: item.product,
                id: item.product.id,
              })
            }
            onIncrement={() => updateQuantity(item.product.id, item.quantity + 1)}
            onDecrement={() => updateQuantity(item.product.id, item.quantity - 1)}
            onRemove={() => removeItem(item.product.id)}
          />
        )}
        ListEmptyComponent={
          <EmptyStateView message={t('emptyShoppingListText')} icon="cart-outline" />
        }
      />

      {/* Checkout Bottom Floating Summary Bar */}
      {cartItems.length > 0 && (
        <View
          style={[
            styles.checkoutBar,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.summaryContainer}>
            <Text style={[styles.itemCountText, { color: colors.textSecondary }]}>
              {t('itemCount', { count: totalQuantity })}
            </Text>
            <Text style={[styles.totalAmount, { color: colors.textPrimary }]}>
              {t('totalPrice', {
                price: CurrencyFormatter.format(totalAmount),
              })}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
            onPress={handleCheckoutPress}
            activeOpacity={0.8}
          >
            <Text style={styles.checkoutButtonText}>{t('checkout')}</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Clear Confirmation Dialog */}
      <ConfirmDialog
        visible={clearDialogVisible}
        title={t('clearShoppingList')}
        message={t('clearShoppingListConfirmationMessage')}
        onConfirm={handleClear}
        onCancel={() => setClearDialogVisible(false)}
      />

      {/* SnackBar */}
      <CustomSnackBar
        visible={snackVisible}
        message={snackMessage}
        type="success"
        onDismiss={() => setSnackVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
  },
  clearButton: {
    padding: 8,
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 84, // Above the floating pill tab bar
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  summaryContainer: {
    flex: 1,
  },
  itemCountText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
