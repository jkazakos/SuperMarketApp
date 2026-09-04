import React from 'react';
import { WishlistScreen } from '@/features/wishlist/screens/WishlistScreen';
import { useNavigation } from 'expo-router';

export default function WishlistRoute() {
  const navigation = useNavigation();
  return (
    <WishlistScreen
      navigation={navigation as any}
      route={{ key: 'Wishlist', name: 'Wishlist' } as any}
    />
  );
}
