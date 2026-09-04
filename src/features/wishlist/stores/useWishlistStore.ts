import { create } from 'zustand';
import { WishlistService } from '../services/wishlistService';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';

interface WishlistState {
  items: string[];
  loading: boolean;
  setItems: (items: string[]) => void;
  toggleWishlist: (productId: string) => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  loading: false,
  setItems: (items) => set({ items }),
  toggleWishlist: async (productId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const inList = get().isInWishlist(productId);
    if (inList) {
      await get().removeFromWishlist(productId);
    } else {
      await get().addToWishlist(productId);
    }
  },
  addToWishlist: async (productId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    await WishlistService.addWishlistItem(user.uid, productId);
  },
  removeFromWishlist: async (productId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    await WishlistService.removeWishlistItem(user.uid, productId);
  },
  clearWishlist: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    await WishlistService.clearWishlist(user.uid);
  },
  isInWishlist: (productId: string) => {
    return get().items.includes(productId);
  },
}));

let unsubscribeWishlist: (() => void) | null = null;

// Subscribe to auth state changes to synchronize wishlist
useAuthStore.subscribe((state) => {
  const user = state.user;
  if (unsubscribeWishlist) {
    unsubscribeWishlist();
    unsubscribeWishlist = null;
  }

  if (user) {
    useWishlistStore.setState({ loading: true });
    unsubscribeWishlist = WishlistService.watchWishlistProductIds(
      user.uid,
      (items) => {
        useWishlistStore.setState({ items, loading: false });
      }
    );
  } else {
    useWishlistStore.setState({ items: [], loading: false });
  }
});
