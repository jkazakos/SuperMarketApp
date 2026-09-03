import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Product } from '@/features/products/types';
import { ShoppingHistory } from '@/features/history/types';

export type MainTabParamList = {
  Products: undefined;
  Wishlist: undefined;
  ShoppingList: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  ProductDetails: { product: Product };
  Checkout: undefined;
  History: undefined;
  HistoryDetails: { history: ShoppingHistory };
  Settings: undefined;
  SignIn: undefined;
  SignUp: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;
