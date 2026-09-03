import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/core/theme/ThemeContext';
import { CartItem, getCartItemTotalPrice } from '@/features/shopping_list/types';
import { getLocalizedName } from '@/features/products/types';
import { CurrencyFormatter } from '@/core/utils/currencyFormatter';

interface CheckoutItemTileProps {
  item: CartItem;
}

const PLACEHOLDER_IMAGE = require('../../../../assets/images/placeholder_image.png');

export const CheckoutItemTile: React.FC<CheckoutItemTileProps> = ({ item }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();

  const product = item.product;
  const totalPrice = getCartItemTotalPrice(item);
  const localizedName = getLocalizedName(product, i18n.language);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
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

      <View style={styles.detailsContainer}>
        <Text
          numberOfLines={2}
          style={[styles.title, { color: colors.textPrimary }]}
        >
          {localizedName}
        </Text>
        <Text style={[styles.quantity, { color: colors.textSecondary }]}>
          {t('productQuantityInList', { quantity: item.quantity })}
        </Text>
      </View>

      <Text style={[styles.totalPrice, { color: colors.primary }]}>
        {CurrencyFormatter.format(totalPrice)} €
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 4,
  },
  quantity: {
    fontSize: 13,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
});
