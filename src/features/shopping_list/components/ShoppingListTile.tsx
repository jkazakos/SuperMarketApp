import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/core/theme/ThemeContext';
import { CartItem, getCartItemTotalPrice } from '../types';
import {
  getLocalizedName,
  getLocalizedCategory,
  getDiscountedPrice,
} from '@/features/products/types';
import { CurrencyFormatter } from '@/core/utils/currencyFormatter';

interface ShoppingListTileProps {
  item: CartItem;
  onPress: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

const PLACEHOLDER_IMAGE = require('../../../../assets/images/placeholder_image.png');

export const ShoppingListTile: React.FC<ShoppingListTileProps> = ({
  item,
  onPress,
  onIncrement,
  onDecrement,
  onRemove,
}) => {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();

  const product = item.product;
  const isSale = product.onSale && product.discount > 0;
  const unitPrice = getDiscountedPrice(product);
  const itemTotal = getCartItemTotalPrice(item);

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
      {/* Thumbnail */}
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
      </View>

      {/* Details */}
      <View style={styles.detailsContainer}>
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
          style={[styles.title, { color: colors.textPrimary }]}
        >
          {localizedName}
        </Text>

        <View style={styles.priceRow}>
          <Text style={[styles.unitPrice, { color: colors.primary }]}>
            {CurrencyFormatter.format(unitPrice)} €
          </Text>
          {isSale && (
            <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
              {CurrencyFormatter.format(product.price)} €
            </Text>
          )}
          <Text style={[styles.itemSubtotal, { color: colors.textSecondary }]}>
            (Total: {CurrencyFormatter.format(itemTotal)} €)
          </Text>
        </View>

        {/* Quantity Controls */}
        <View style={styles.bottomRow}>
          <View
            style={[
              styles.quantityControls,
              {
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.border,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={onDecrement}
              activeOpacity={0.7}
            >
              <Ionicons name="remove" size={16} color={colors.textPrimary} />
            </TouchableOpacity>

            <Text style={[styles.quantityText, { color: colors.textPrimary }]}>
              {item.quantity}
            </Text>

            <TouchableOpacity
              style={styles.qtyButton}
              onPress={onIncrement}
              disabled={item.quantity >= product.quantityAvailable}
              activeOpacity={0.7}
            >
              <Ionicons
                name="add"
                size={16}
                color={
                  item.quantity >= product.quantityAvailable
                    ? colors.textSecondary
                    : colors.textPrimary
                }
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={onRemove}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    width: 84,
    height: 84,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
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
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  unitPrice: {
    fontSize: 15,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  itemSubtotal: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 4,
    height: 32,
  },
  qtyButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 8,
  },
  deleteButton: {
    padding: 6,
  },
});
