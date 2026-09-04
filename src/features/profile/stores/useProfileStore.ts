import { useHistoryStore } from '@/features/history/stores/useHistoryStore';
import {
  calculateSpendingTotals,
  SpendingTotals,
} from '../utils/spendingCalculation';

export { calculateSpendingTotals, SpendingTotals };

export const useSpendingTotals = (): SpendingTotals => {
  const history = useHistoryStore((s) => s.history);
  return calculateSpendingTotals(history);
};
