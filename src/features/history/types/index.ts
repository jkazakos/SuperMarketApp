export interface ShoppingHistoryItem {
  productId: string;
  productName: Record<string, string>;
  quantity: number;
  priceAtPurchase: number;
}

export interface ShoppingHistory {
  id: string;
  items: ShoppingHistoryItem[];
  totalAmount: number;
  datePurchased: Date | null;
}

export const getHistoryItemLocalizedName = (
  item: ShoppingHistoryItem,
  locale: string = 'en'
): string => {
  return (
    item.productName[locale] || item.productName['en'] || Object.values(item.productName)[0] || ''
  );
};
