import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/core/theme/ThemeContext';
import { useWishlistStore } from '../stores/useWishlistStore';
import { useProductStore } from '@/features/products/stores/useProductStore';
import { useCartStore } from '@/features/shopping_list/stores/useCartStore';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { Product } from '@/features/products/types';
import { WishlistItemCard } from '../components/WishlistItemCard';
import { WishlistHeader } from '../components/WishlistHeader';
import { QuantityModal } from '@/features/products/components/QuantityModal';
import { ConfirmDialog } from '@/core/components/ConfirmDialog';
import { EmptyStateView } from '@/core/components/EmptyStateView';
import { CustomSnackBar } from '@/core/components/CustomSnackBar';
import { RootStackScreenProps } from '@/navigation/types';

export const WishlistScreen: React.FC<RootStackScreenProps<'Wishlist'>> = ({
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
    (navigation as any).navigate('product-details', { product, id: product.id });
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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Platform-Specific Native Header (iOS UIKit navigation vs Android Material 3 header) */}
        <WishlistHeader title={t('wishlist')} onBack={() => navigation.goBack()} />
        <EmptyStateView message={t('guestMessage')} icon="lock-closed-outline" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Platform-Specific Native Header (iOS UIKit navigation vs Android Material 3 header) */}
      <WishlistHeader
        title={t('wishlist')}
        onBack={() => navigation.goBack()}
        onClear={
          wishlistProducts.length > 0 ? () => setClearDialogVisible(true) : undefined
        }
      />

      {/* Wishlist Items List */}
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        data={wishlistProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom + 20, 40),
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
});
