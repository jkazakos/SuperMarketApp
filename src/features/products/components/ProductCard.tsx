import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/core/theme/ThemeContext';
import {
  Product,
  getLocalizedName,
  getLocalizedCategory,
  getDiscountedPrice,
} from '../types';
import { CurrencyFormatter } from '@/core/utils/currencyFormatter';

interface ProductCardProps {
  product: Product;
  isInWishlist: boolean;
  onPress: () => void;
  onToggleWishlist: () => void;
  onAddToCart: () => void;
}

const PLACEHOLDER_IMAGE = require('../../../../assets/images/placeholder_image.png');

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isInWishlist,
  onPress,
  onToggleWishlist,
  onAddToCart,
}) => {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();

  const isSoldOut = product.quantityAvailable <= 0;
  const isSale = product.onSale && product.discount > 0;
  const finalPrice = getDiscountedPrice(product);

  const localizedName = getLocalizedName(product, i18n.language);
  const localizedCategory = getLocalizedCategory(product, i18n.language);

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
      activeOpacity={0.8}
    >
      {/* Image container */}
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

        {/* Sale badge */}
        {isSale && (
          <View style={[styles.saleBadge, { backgroundColor: colors.discount }]}>
            <Text style={styles.badgeText}>
              -{Math.round(product.discount * 100)}%
            </Text>
          </View>
        )}

        {/* Out of Stock overlay */}
        {isSoldOut && (
          <View style={styles.soldOutOverlay}>
            <Text style={styles.soldOutText}>{t('soldOut')}</Text>
          </View>
        )}

        {/* Wishlist Button */}
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={onToggleWishlist}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isInWishlist ? 'heart' : 'heart-outline'}
            size={22}
            color={isInWishlist ? colors.secondary : '#475569'}
          />
        </TouchableOpacity>
      </View>

      {/* Info Container */}
      <View style={styles.infoContainer}>
        {localizedCategory !== '' && (
          <Text
            numberOfLines={1}
            style={[styles.categoryText, { color: colors.textSecondary }]}
          >
            {localizedCategory}
          </Text>
        )}

        <Text
          numberOfLines={2}
          style={[styles.titleText, { color: colors.textPrimary }]}
        >
          {localizedName}
        </Text>

        {/* Price & Action Row */}
        <View style={styles.bottomRow}>
          <View style={styles.priceContainer}>
            <Text style={[styles.finalPrice, { color: colors.textPrimary }]}>
              {CurrencyFormatter.format(finalPrice)} €
            </Text>
            {isSale && (
              <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
                {CurrencyFormatter.format(product.price)} €
              </Text>
            )}
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity
            style={[
              styles.cartButton,
              {
                backgroundColor: isSoldOut ? colors.surfaceVariant : colors.primary,
              },
            ]}
            onPress={onAddToCart}
            disabled={isSoldOut}
            activeOpacity={0.8}
          >
            <Ionicons
              name="add"
              size={20}
              color={isSoldOut ? colors.textSecondary : '#FFFFFF'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  imageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  saleBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  soldOutOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOutText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  categoryText: {
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '600',
    minHeight: 38,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  priceContainer: {
    flex: 1,
  },
  finalPrice: {
    fontSize: 15,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  cartButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
