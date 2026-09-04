import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Product } from '@/features/products/types';
import { ShoppingHistory } from '@/features/history/types';

export type MainTabParamList = {
  Products: undefined;
  Wishlist: undefined;
  ShoppingList: undefined;
  Profile: undefined;
};

export type MainTabScreenProps<
  T extends keyof MainTabParamList = keyof MainTabParamList,
> = {
  navigation: any;
  route: { key: string; name: T; params?: any };
};

export type RootStackParamList = {
  '(tabs)': undefined;
  MainTabs: undefined;
  'product-details': { product: Product };
  checkout: undefined;
  history: undefined;
  'history-details': { history: ShoppingHistory };
  settings: undefined;
  'sign-in': undefined;
  'sign-up': undefined;
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
