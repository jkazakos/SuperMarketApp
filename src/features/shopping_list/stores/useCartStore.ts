import { create } from 'zustand';
import { ShoppingListItem, CartItem, getCartItemTotalPrice } from '../types';
import { ShoppingListService } from '../services/shoppingListService';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useProductStore } from '@/features/products/stores/useProductStore';

interface CartState {
  rawItems: ShoppingListItem[];
  cartItems: CartItem[];
  totalAmount: number;
  totalQuantity: number;
  loading: boolean;
  setRawItems: (rawItems: ShoppingListItem[]) => void;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, newQuantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const computeCart = (
  rawItems: ShoppingListItem[]
): {
  cartItems: CartItem[];
  totalAmount: number;
  totalQuantity: number;
} => {
  const products = useProductStore.getState().products;
  const cartItems: CartItem[] = [];
  let totalAmount = 0;
  let totalQuantity = 0;

  for (const raw of rawItems) {
    const product = products.find((p) => p.id === raw.productId);
    if (product) {
      const item: CartItem = {
        product,
        quantity: raw.productQuantity,
      };
      cartItems.push(item);
      totalAmount += getCartItemTotalPrice(item);
      totalQuantity += raw.productQuantity;
    }
  }

  return { cartItems, totalAmount, totalQuantity };
};

export const useCartStore = create<CartState>((set, get) => ({
  rawItems: [],
  cartItems: [],
  totalAmount: 0,
  totalQuantity: 0,
  loading: false,

  setRawItems: (rawItems: ShoppingListItem[]) => {
    const { cartItems, totalAmount, totalQuantity } = computeCart(rawItems);
    set({ rawItems, cartItems, totalAmount, totalQuantity });
  },

  addItem: async (productId: string, quantity: number = 1) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    await ShoppingListService.addOrUpdateItem(user.uid, productId, quantity);
  },

  updateQuantity: async (productId: string, newQuantity: number) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    await ShoppingListService.updateQuantity(user.uid, productId, newQuantity);
  },

  removeItem: async (productId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    await ShoppingListService.removeItem(user.uid, productId);
  },

  clearCart: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    await ShoppingListService.clearShoppingList(user.uid);
  },
}));

let unsubscribeCart: (() => void) | null = null;

// Recompute cart whenever products change (e.g. initial load or price changes)
useProductStore.subscribe(() => {
  const rawItems = useCartStore.getState().rawItems;
  const { cartItems, totalAmount, totalQuantity } = computeCart(rawItems);
  useCartStore.setState({ cartItems, totalAmount, totalQuantity });
});

// Subscribe to auth state changes to synchronize shopping list
useAuthStore.subscribe((state) => {
  const user = state.user;
  if (unsubscribeCart) {
    unsubscribeCart();
    unsubscribeCart = null;
  }

  if (user) {
    useCartStore.setState({ loading: true });
    unsubscribeCart = ShoppingListService.watchShoppingListItems(
      user.uid,
      (rawItems) => {
        const { cartItems, totalAmount, totalQuantity } = computeCart(rawItems);
        useCartStore.setState({
          rawItems,
          cartItems,
          totalAmount,
          totalQuantity,
          loading: false,
        });
      }
    );
  } else {
    useCartStore.setState({
      rawItems: [],
      cartItems: [],
      totalAmount: 0,
      totalQuantity: 0,
      loading: false,
    });
  }
});
