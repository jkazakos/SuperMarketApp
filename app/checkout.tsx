import React from 'react';
import { useNavigation } from 'expo-router';
import { CheckoutScreen } from '@/features/checkout/screens/CheckoutScreen';

export default function CheckoutRoute() {
  const navigation = useNavigation();
  return (
    <CheckoutScreen
      navigation={navigation as any}
      route={{
        key: 'Checkout',
        name: 'Checkout',
        params: undefined,
      }}
    />
  );
}
