import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { MainTabScreenProps } from '@/navigation/types';

export const ProductsScreen: React.FC<MainTabScreenProps<'Products'>> = ({
  navigation,
}) => {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

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
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: Math.max(insets.top, 16),
        },
      ]}
    >
      {/* Top Header & Search Bar */}
      <View style={styles.header}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surfaceVariant,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={colors.textSecondary}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder={t('search')}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter & Sort Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: selectedCategory
                  ? colors.primaryContainer
                  : colors.surfaceVariant,
                borderColor: selectedCategory ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setCategoryModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="filter-outline"
              size={18}
              color={selectedCategory ? colors.primary : colors.textPrimary}
            />
            <Text
              style={[
                styles.actionButtonText,
                { color: selectedCategory ? colors.primary : colors.textPrimary },
              ]}
            >
              {selectedCategory || t('categoryFilter')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setSortModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="swap-vertical-outline"
              size={18}
              color={colors.textPrimary}
            />
            <Text style={[styles.actionButtonText, { color: colors.textPrimary }]}>
              {t('sort')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Product Grid */}
      <FlatList
        data={displayProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 100 }, // Space for floating bottom pill bar
        ]}
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
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 10,
    paddingTop: 4,
    flexGrow: 1,
  },
});
