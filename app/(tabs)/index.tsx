import React from 'react';
import { ProductsScreen } from '@/features/products/screens/ProductsScreen';
import { useNavigation } from 'expo-router';

export default function ProductsRoute() {
  const navigation = useNavigation();
  return (
    <ProductsScreen
      navigation={navigation as any}
      route={{ key: 'Products', name: 'Products' } as any}
    />
  );
}
