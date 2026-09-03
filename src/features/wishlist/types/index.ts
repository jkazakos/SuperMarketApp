import { Product } from '@/features/products/types';

export interface WishlistItem {
  productId: string;
}

export interface WishlistProductItem {
  product: Product;
}
