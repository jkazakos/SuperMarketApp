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
} from '@/features/products/types';
import { CurrencyFormatter } from '@/core/utils/currencyFormatter';

interface WishlistItemCardProps {
  product: Product;
  onPress: () => void;
  onRemove: () => void;
  onAddToCart: () => void;
}

const PLACEHOLDER_IMAGE = require('../../../../assets/images/placeholder_image.png');

export const WishlistItemCard: React.FC<WishlistItemCardProps> = ({
  product,
  onPress,
  onRemove,
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
      accessibilityRole="button"
      accessibilityLabel={`${localizedName}, ${CurrencyFormatter.format(finalPrice)} €${isSoldOut ? `, ${t('soldOut')}` : ''}`}
    >
      {/* Thumbnail */}
      <View style={[styles.imageContainer, { backgroundColor: colors.surfaceVariant }]}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <Image source={PLACEHOLDER_IMAGE} style={styles.image} resizeMode="contain" />
        )}
        {isSale && (
          <View style={[styles.saleBadge, { backgroundColor: colors.discount }]}>
            <Text style={styles.badgeText}>-{Math.round(product.discount * 100)}%</Text>
          </View>
        )}
      </View>

      {/* Details */}
      <View style={styles.detailsContainer}>
        {localizedCategory !== '' && (
          <Text numberOfLines={1} style={[styles.categoryText, { color: colors.textSecondary }]}>
            {localizedCategory}
          </Text>
        )}

        <Text numberOfLines={2} style={[styles.title, { color: colors.textPrimary }]}>
          {localizedName}
        </Text>

        <View style={styles.priceRow}>
          <Text style={[styles.finalPrice, { color: colors.primary }]}>
            {CurrencyFormatter.format(finalPrice)} €
          </Text>
          {isSale && (
            <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
              {CurrencyFormatter.format(product.price)} €
            </Text>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionColumn}>
        <TouchableOpacity
          style={[styles.removeButton, { backgroundColor: colors.error + '12' }]}
          onPress={onRemove}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('removeFromWishlist')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
        </TouchableOpacity>

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
          accessibilityRole="button"
          accessibilityLabel={t('addToShoppingList')}
          accessibilityState={{ disabled: isSoldOut }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="cart-outline"
            size={18}
            color={isSoldOut ? colors.textSecondary : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  imageContainer: {
    width: 84,
    height: 84,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  saleBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: '800',
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  finalPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  actionColumn: {
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginLeft: 8,
  },
  removeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
