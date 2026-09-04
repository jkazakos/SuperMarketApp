import { Product, getDiscountedPrice } from '@/features/products/types';

export interface ShoppingListItem {
  id: string;
  productId: string;
  productQuantity: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export const getCartItemTotalPrice = (item: CartItem): number => {
  return getDiscountedPrice(item.product) * item.quantity;
};
