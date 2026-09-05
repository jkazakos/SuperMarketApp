import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Product } from '@/features/products/types';
import { ShoppingHistory } from '@/features/history/types';

export type MainTabParamList = {
  Products: undefined;
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
  wishlist: undefined;
  Wishlist: undefined;
  'product-details': { product: Product; id?: string };
  checkout: undefined;
  history: undefined;
  'history-details': { id: string };
  settings: undefined;
  'sign-in': undefined;
  'sign-up': undefined;
  ProductDetails: { product: Product; id?: string };
  Checkout: undefined;
  History: undefined;
  HistoryDetails: { id: string; history?: ShoppingHistory };
  Settings: undefined;
  SignIn: undefined;
  SignUp: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
