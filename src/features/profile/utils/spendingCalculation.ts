export interface SpendingTotals {
  weekly: number;
  monthly: number;
}

export const calculateSpendingTotals = (
  history: { totalAmount: number; datePurchased: Date | null }[]
): SpendingTotals => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  let weekly = 0;
  let monthly = 0;

  for (const purchase of history) {
    if (!purchase.datePurchased) continue;

    const date = purchase.datePurchased;
    if (date >= oneWeekAgo) {
      weekly += purchase.totalAmount;
    }
    if (date >= monthStart) {
      monthly += purchase.totalAmount;
    }
  }

  return { weekly, monthly };
};
