import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/core/theme/ThemeContext';
import {
  useProductStore,
  getFilteredAndSortedProducts,
} from '../stores/useProductStore';
import { useWishlistStore } from '@/features/wishlist/stores/useWishlistStore';
import { useCartStore } from '@/features/shopping_list/stores/useCartStore';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { Product, getLocalizedCategory } from '../types';
import { ProductCard } from '../components/ProductCard';
import { CategoryFilterModal } from '../components/CategoryFilterModal';
import { SortModal } from '../components/SortModal';
import { QuantityModal } from '../components/QuantityModal';
import { EmptyStateView } from '@/core/components/EmptyStateView';
import { LoadingIndicator } from '@/core/components/LoadingIndicator';
import { CustomSnackBar } from '@/core/components/CustomSnackBar';
import { ProductsHeader } from '../components/ProductsHeader';
import { MainTabScreenProps } from '@/navigation/types';

export const ProductsScreen: React.FC<MainTabScreenProps<'Products'>> = ({
  navigation,
}) => {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();

  const user = useAuthStore((s) => s.user);
  const products = useProductStore((s) => s.products);
  const loading = useProductStore((s) => s.loading);
  const searchQuery = useProductStore((s) => s.searchQuery);
  const selectedCategory = useProductStore((s) => s.selectedCategory);
  const sortType = useProductStore((s) => s.sortType);

  const setSearchQuery = useProductStore((s) => s.setSearchQuery);
  const setSelectedCategory = useProductStore((s) => s.setSelectedCategory);
  const setSortType = useProductStore((s) => s.setSortType);

  const wishlistItems = useWishlistStore((s) => s.items);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const addToCart = useCartStore((s) => s.addItem);

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [selectedProductForCart, setSelectedProductForCart] =
    useState<Product | null>(null);

  const [snackMessage, setSnackMessage] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);

  // Extract unique categories based on active locale
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      const c = getLocalizedCategory(p, i18n.language);
      if (c && c.trim() !== '') {
        cats.add(c);
      }
    });
    return Array.from(cats).sort();
  }, [products, i18n.language]);

  // Compute filtered & sorted products
  const displayProducts = useMemo(() => {
    return getFilteredAndSortedProducts(
      products,
      searchQuery,
      selectedCategory,
      sortType,
      i18n.language
    );
  }, [products, searchQuery, selectedCategory, sortType, i18n.language]);

  const handleProductPress = (product: Product) => {
    (navigation as any).navigate('product-details', { product, id: product.id });
  };

  const handleToggleWishlist = async (productId: string) => {
    if (!user) {
      setSnackMessage(t('signInRequired'));
      setSnackVisible(true);
      return;
    }
    await toggleWishlist(productId);
  };

  const handleAddToCart = (product: Product) => {
    if (!user) {
      setSnackMessage(t('signInRequired'));
      setSnackVisible(true);
      return;
    }
    setSelectedProductForCart(product);
  };

  const handleQuantitySubmit = async (quantity: number) => {
    if (!selectedProductForCart) return;
    await addToCart(selectedProductForCart.id, quantity);
    setSnackMessage(t('addedToShoppingList'));
    setSnackVisible(true);
  };

  if (loading && products.length === 0) {
    return <LoadingIndicator />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Platform-Specific Native Header (iOS UIKit bar items vs Android Material 3 header) */}
      <ProductsHeader
        title={t('titleActivityProducts')}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenCategoryFilter={() => setCategoryModalVisible(true)}
        sortType={sortType}
        onOpenSort={() => setSortModalVisible(true)}
        onSelectSort={setSortType}
        categories={categories}
      />

      {/* Product Grid */}
      <FlatList
        data={displayProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: 8,
            paddingBottom: 110, // Generous padding so cards scroll comfortably above NativeTabs
          },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          selectedCategory ? (
            <View style={styles.categoryPillRow}>
              <TouchableOpacity
                style={[
                  styles.activeCategoryPill,
                  {
                    backgroundColor: colors.isDark
                      ? 'rgba(99, 102, 241, 0.25)'
                      : 'rgba(79, 70, 229, 0.12)',
                    borderColor: colors.isDark
                      ? 'rgba(129, 140, 248, 0.45)'
                      : 'rgba(79, 70, 229, 0.3)',
                  },
                ]}
                onPress={() => setSelectedCategory(null)}
                activeOpacity={0.7}
              >
                <Text style={[styles.activeCategoryText, { color: colors.primary }]}>
                  {selectedCategory}
                </Text>
                <Ionicons name="close-circle" size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            isInWishlist={wishlistItems.includes(item.id)}
            onPress={() => handleProductPress(item)}
            onToggleWishlist={() => handleToggleWishlist(item.id)}
            onAddToCart={() => handleAddToCart(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyStateView
            message={
              searchQuery
                ? t('noResultsFound', { query: searchQuery })
                : t('noProductsAvailable')
            }
            icon="search-outline"
          />
        }
      />

      {/* Category Modal */}
      <CategoryFilterModal
        visible={categoryModalVisible}
        categories={categories}
        selectedCategory={selectedCategory}
        onClose={() => setCategoryModalVisible(false)}
        onSelect={setSelectedCategory}
      />

      {/* Sort Modal */}
      <SortModal
        visible={sortModalVisible}
        selectedSort={sortType}
        onClose={() => setSortModalVisible(false)}
        onSelect={setSortType}
      />

      {/* Quantity Modal */}
      <QuantityModal
        visible={Boolean(selectedProductForCart)}
        product={selectedProductForCart}
        onClose={() => setSelectedProductForCart(null)}
        onSubmit={handleQuantitySubmit}
      />

      {/* SnackBar Notification */}
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
  categoryPillRow: {
    flexDirection: 'row',
    paddingTop: 8,
  },
  listContent: {
    paddingHorizontal: 10,
    flexGrow: 1,
  },
  activeCategoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 1,
  },
  activeCategoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
