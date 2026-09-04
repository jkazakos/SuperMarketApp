import React from 'react';
import { ShoppingListScreen } from '@/features/shopping_list/screens/ShoppingListScreen';
import { useNavigation } from 'expo-router';

export default function ShoppingListRoute() {
  const navigation = useNavigation();
  return (
    <ShoppingListScreen
      navigation={navigation as any}
      route={{ key: 'ShoppingList', name: 'ShoppingList' } as any}
    />
  );
}
