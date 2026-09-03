import { ProductService } from '@/features/products/services/productService';
import { HistoryService } from '@/features/history/services/historyService';
import { ShoppingListService } from '@/features/shopping_list/services/shoppingListService';
import { CartItem } from '@/features/shopping_list/types';
import { getDiscountedPrice, getLocalizedName } from '@/features/products/types';
import { ShoppingHistoryItem } from '@/features/history/types';

export class CheckoutService {
  /**
   * Processes a purchase:
   * 1. Decrements stock for each cart item via Firestore transactions
   * 2. Writes an immutable order record to purchase history
   * 3. Clears the user's shopping cart
   *
   * @returns null on success, or the name of the out-of-stock product on failure
   */
  static async processPurchase({
    userId,
    items,
    totalAmount,
    locale,
  }: {
    userId: string;
    items: CartItem[];
    totalAmount: number;
    locale: string;
  }): Promise<{ success: boolean; outOfStockProduct?: string; error?: string }> {
    try {
      // 1. Decrement stock for each item
      for (const item of items) {
        const success = await ProductService.decreaseProductQuantity(
          item.product.id,
          item.quantity
        );

        if (!success) {
          return {
            success: false,
            outOfStockProduct: getLocalizedName(item.product, locale),
          };
        }
      }

      // 2. Save purchase history snapshot
      const historyItems: ShoppingHistoryItem[] = items.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        priceAtPurchase: getDiscountedPrice(item.product),
      }));

      await HistoryService.savePurchaseHistory(userId, historyItems, totalAmount);

      // 3. Clear shopping list
      await ShoppingListService.clearShoppingList(userId);

      return { success: true };
    } catch (e: any) {
      console.error('Checkout error:', e);
      return { success: false, error: e.message || 'Checkout failed' };
    }
  }
}
