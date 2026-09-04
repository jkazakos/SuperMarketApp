import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/core/theme/ThemeContext';
import { RootStackScreenProps } from '@/navigation/types';
import {
  getLocalizedName,
  getLocalizedDescription,
  getLocalizedCategory,
  getDiscountedPrice,
} from '../types';
import { useWishlistStore } from '@/features/wishlist/stores/useWishlistStore';
import { useCartStore } from '@/features/shopping_list/stores/useCartStore';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { CurrencyFormatter } from '@/core/utils/currencyFormatter';
import { CustomSnackBar } from '@/core/components/CustomSnackBar';

const PLACEHOLDER_IMAGE = require('../../../../assets/images/placeholder_image.png');

export const ProductDetailsScreen: React.FC<
  RootStackScreenProps<'ProductDetails'>
> = ({ route, navigation }) => {
  const product = route?.params?.product;
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const user = useAuthStore((s) => s.user);
  const isInWishlist = useWishlistStore((s) =>
    product?.id ? s.isInWishlist(product.id) : false
  );
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const addToCart = useCartStore((s) => s.addItem);

  const [quantity, setQuantity] = useState(1);
  const [snackMessage, setSnackMessage] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);

  if (!product || typeof product !== 'object' || !product.id) {
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
          {t('productNotFound', 'Product not found')}
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

  const isSoldOut = product.quantityAvailable <= 0;
  const isSale = product.onSale && product.discount > 0;
  const finalPrice = getDiscountedPrice(product);

  const localizedName = getLocalizedName(product, i18n.language);
  const localizedDescription = getLocalizedDescription(product, i18n.language);
  const localizedCategory = getLocalizedCategory(product, i18n.language);

  const handleToggleWishlist = async () => {
    if (!user) {
      setSnackMessage(t('signInRequired'));
      setSnackVisible(true);
      return;
    }
    await toggleWishlist(product.id);
  };

  const handleAddToCart = async () => {
    if (!user) {
      setSnackMessage(t('signInRequired'));
      setSnackVisible(true);
      return;
    }
    if (quantity > product.quantityAvailable) {
      setSnackMessage(t('exceededStockItem', { item: localizedName }));
      setSnackVisible(true);
      return;
    }
    await addToCart(product.id, quantity);
    setSnackMessage(t('addedToShoppingList'));
    setSnackVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Container with floating action buttons */}
        <View
          style={[styles.imageContainer, { backgroundColor: colors.surfaceVariant }]}
        >
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={PLACEHOLDER_IMAGE}
              style={styles.image}
              resizeMode="contain"
            />
          )}

          {/* Top Bar Floating Buttons */}
          <View
            style={[styles.floatingNav, { paddingTop: Math.max(insets.top, 16) }]}
          >
            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={22} color="#0F172A" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.circleButton}
              onPress={handleToggleWishlist}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isInWishlist ? 'heart' : 'heart-outline'}
                size={22}
                color={isInWishlist ? colors.secondary : '#0F172A'}
              />
            </TouchableOpacity>
          </View>

          {isSale && (
            <View style={[styles.saleBadge, { backgroundColor: colors.discount }]}>
              <Text style={styles.badgeText}>
                -{Math.round(product.discount * 100)}%
              </Text>
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {localizedCategory !== '' && (
            <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
              {localizedCategory}
            </Text>
          )}

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {localizedName}
          </Text>

          {/* Price & Stock Row */}
          <View style={styles.priceStockRow}>
            <View>
              <View style={styles.priceContainer}>
                <Text style={[styles.finalPrice, { color: colors.primary }]}>
                  {CurrencyFormatter.format(finalPrice)} €
                </Text>
                {isSale && (
                  <Text
                    style={[styles.originalPrice, { color: colors.textSecondary }]}
                  >
                    {CurrencyFormatter.format(product.price)} €
                  </Text>
                )}
              </View>
            </View>

            <View
              style={[
                styles.stockBadge,
                {
                  backgroundColor: isSoldOut
                    ? colors.error + '20'
                    : colors.success + '20',
                },
              ]}
            >
              <Text
                style={[
                  styles.stockText,
                  { color: isSoldOut ? colors.error : colors.success },
                ]}
              >
                {isSoldOut
                  ? t('outOfStock')
                  : t('productAvailability', {
                      quantity: product.quantityAvailable,
                    })}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.divider} />
          <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
            Description
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {localizedDescription || t('noDescription')}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View
        style={[
          styles.bottomActionBar,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
      >
        {/* Quantity Increment/Decrement */}
        {!isSoldOut && (
          <View
            style={[
              styles.quantityPicker,
              {
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.border,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              <Ionicons
                name="remove"
                size={18}
                color={quantity <= 1 ? colors.textSecondary : colors.textPrimary}
              />
            </TouchableOpacity>

            <Text style={[styles.qtyText, { color: colors.textPrimary }]}>
              {quantity}
            </Text>

            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() =>
                setQuantity((q) => Math.min(product.quantityAvailable, q + 1))
              }
              disabled={quantity >= product.quantityAvailable}
            >
              <Ionicons
                name="add"
                size={18}
                color={
                  quantity >= product.quantityAvailable
                    ? colors.textSecondary
                    : colors.textPrimary
                }
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Add to Cart Button */}
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            {
              backgroundColor: isSoldOut ? colors.surfaceVariant : colors.primary,
            },
          ]}
          onPress={handleAddToCart}
          disabled={isSoldOut}
          activeOpacity={0.8}
        >
          <Ionicons
            name="cart-outline"
            size={20}
            color={isSoldOut ? colors.textSecondary : '#FFFFFF'}
          />
          <Text
            style={[
              styles.addToCartText,
              { color: isSoldOut ? colors.textSecondary : '#FFFFFF' },
            ]}
          >
            {isSoldOut ? t('soldOut') : t('addToShoppingList')}
          </Text>
        </TouchableOpacity>
      </View>

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
  imageContainer: {
    height: 320,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  floatingNav: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  circleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  saleBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  contentSection: {
    padding: 20,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    marginBottom: 16,
  },
  priceStockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  finalPrice: {
    fontSize: 26,
    fontWeight: '800',
  },
  originalPrice: {
    fontSize: 18,
    textDecorationLine: 'line-through',
  },
  stockBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  stockText: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.15)',
    marginVertical: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  quantityPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 6,
    height: 48,
  },
  qtyButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 12,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    gap: 8,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
