import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { MainTabParamList } from './types';
import { ProductsScreen } from '@/features/products/screens/ProductsScreen';
import { WishlistScreen } from '@/features/wishlist/screens/WishlistScreen';
import { ShoppingListScreen } from '@/features/shopping_list/screens/ShoppingListScreen';
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';
import { FloatingPillNavBar } from '@/core/components/FloatingPillNavBar';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const TabNavigator: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingPillNavBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{
          tabBarLabel: t('titleActivityProducts'),
          title: t('titleActivityProducts'),
        }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{
          tabBarLabel: t('wishlist'),
          title: t('wishlist'),
        }}
      />
      <Tab.Screen
        name="ShoppingList"
        component={ShoppingListScreen}
        options={{
          tabBarLabel: t('shoppingList'),
          title: t('shoppingList'),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('userProfile'),
          title: t('userProfile'),
        }}
      />
    </Tab.Navigator>
  );
};
