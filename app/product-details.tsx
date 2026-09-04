import React from 'react';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { ProductDetailsScreen } from '@/features/products/screens/ProductDetailsScreen';

export default function ProductDetailsRoute() {
  const navigation = useNavigation();
  const rawParams = useLocalSearchParams();

  let product = (rawParams as any).product;
  if (typeof product === 'string') {
    try {
      product = JSON.parse(product);
    } catch {
      // Keep as string if parsing fails
    }
  }

  return (
    <ProductDetailsScreen
      navigation={navigation as any}
      route={{
        key: 'ProductDetails',
        name: 'ProductDetails',
        params: { product },
      }}
    />
  );
}
