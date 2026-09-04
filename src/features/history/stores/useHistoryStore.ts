import { create } from 'zustand';
import { ShoppingHistory } from '../types';
import { HistoryService } from '../services/historyService';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';

interface HistoryState {
  history: ShoppingHistory[];
  loading: boolean;
  clearHistory: () => Promise<void>;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  history: [],
  loading: false,

  clearHistory: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    await HistoryService.clearPurchaseHistory(user.uid);
  },
}));

let unsubscribeHistory: (() => void) | null = null;

useAuthStore.subscribe((state) => {
  const user = state.user;
  if (unsubscribeHistory) {
    unsubscribeHistory();
    unsubscribeHistory = null;
  }

  if (user) {
    useHistoryStore.setState({ loading: true });
    unsubscribeHistory = HistoryService.watchPurchaseHistory(user.uid, (history) => {
      useHistoryStore.setState({ history, loading: false });
    });
  } else {
    useHistoryStore.setState({ history: [], loading: false });
  }
});
