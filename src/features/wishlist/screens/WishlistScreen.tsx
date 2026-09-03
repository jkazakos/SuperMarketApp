import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/core/theme/ThemeContext';
import { useWishlistStore } from '../stores/useWishlistStore';
import { useProductStore } from '@/features/products/stores/useProductStore';
import { useCartStore } from '@/features/shopping_list/stores/useCartStore';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { Product } from '@/features/products/types';
import { WishlistItemCard } from '../components/WishlistItemCard';
import { QuantityModal } from '@/features/products/components/QuantityModal';
import { ConfirmDialog } from '@/core/components/ConfirmDialog';
import { EmptyStateView } from '@/core/components/EmptyStateView';
import { CustomSnackBar } from '@/core/components/CustomSnackBar';
import { MainTabScreenProps } from '@/navigation/types';

export const WishlistScreen: React.FC<MainTabScreenProps<'Wishlist'>> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const user = useAuthStore((s) => s.user);
  const wishlistIds = useWishlistStore((s) => s.items);
  const removeFromWishlist = useWishlistStore((s) => s.removeFromWishlist);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);

  const allProducts = useProductStore((s) => s.products);
  const addToCart = useCartStore((s) => s.addItem);

  const [clearDialogVisible, setClearDialogVisible] = useState(false);
  const [selectedProductForCart, setSelectedProductForCart] =
    useState<Product | null>(null);
  const [snackMessage, setSnackMessage] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);

  // Map wishlist product IDs to Product objects
  const wishlistProducts = useMemo(() => {
    const list: Product[] = [];
    for (const id of wishlistIds) {
      const prod = allProducts.find((p) => p.id === id);
      if (prod) {
        list.push(prod);
      }
    }
    return list;
  }, [wishlistIds, allProducts]);

  const handleProductPress = (product: Product) => {
    (navigation as any).navigate('ProductDetails', { product });
  };

  const handleClear = async () => {
    await clearWishlist();
    setClearDialogVisible(false);
    setSnackMessage(t('wishlistCleared'));
    setSnackVisible(true);
  };

  const handleAddToCart = (product: Product) => {
    setSelectedProductForCart(product);
  };

  const handleQuantitySubmit = async (quantity: number) => {
    if (!selectedProductForCart) return;
    await addToCart(selectedProductForCart.id, quantity);
    setSnackMessage(t('addedToShoppingList'));
    setSnackVisible(true);
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
          {t('wishlist')}
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
      {/* Header with Title and Clear Action */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {t('wishlist')}
        </Text>

        {wishlistProducts.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setClearDialogVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* Wishlist Items List */}
      <FlatList
        data={wishlistProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingBottom: 110,
          flexGrow: 1,
        }}
        renderItem={({ item }) => (
          <WishlistItemCard
            product={item}
            onPress={() => handleProductPress(item)}
            onRemove={() => removeFromWishlist(item.id)}
            onAddToCart={() => handleAddToCart(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyStateView message={t('emptyWishlistText')} icon="heart-outline" />
        }
      />

      {/* Clear Confirmation Dialog */}
      <ConfirmDialog
        visible={clearDialogVisible}
        title={t('clearWishlist')}
        message={t('clearWishlistConfirmationMessage')}
        onConfirm={handleClear}
        onCancel={() => setClearDialogVisible(false)}
      />

      {/* Quantity Modal */}
      <QuantityModal
        visible={Boolean(selectedProductForCart)}
        product={selectedProductForCart}
        onClose={() => setSelectedProductForCart(null)}
        onSubmit={handleQuantitySubmit}
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
});
