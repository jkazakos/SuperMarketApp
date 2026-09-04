import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  getDocs,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/core/config/firebase';
import { ShoppingHistory, ShoppingHistoryItem } from '../types';

export class HistoryService {
  private static getCollection(userId: string) {
    return collection(db, 'users', userId, 'purchaseHistory');
  }

  static watchPurchaseHistory(
    userId: string,
    callback: (history: ShoppingHistory[]) => void
  ) {
    const q = query(
      HistoryService.getCollection(userId),
      orderBy('datePurchased', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const records: ShoppingHistory[] = snapshot.docs.map((d) => {
          const data = d.data();
          let datePurchased: Date | null = null;
          if (data.datePurchased instanceof Timestamp) {
            datePurchased = data.datePurchased.toDate();
          } else if (typeof data.datePurchased === 'number') {
            datePurchased = new Date(data.datePurchased);
          }

          const rawItems = Array.isArray(data.items) ? data.items : [];
          const items: ShoppingHistoryItem[] = rawItems.map((item: any) => ({
            productId: String(item.productId || ''),
            productName:
              typeof item.productName === 'object' ? item.productName : {},
            quantity: Number(item.quantity) || 1,
            priceAtPurchase: Number(item.priceAtPurchase) || 0,
          }));

          return {
            id: d.id,
            items,
            totalAmount: Number(data.totalAmount) || 0,
            datePurchased,
          };
        });

        callback(records);
      },
      (error) => {
        console.error('Error listening to purchase history:', error);
        callback([]);
      }
    );
  }

  static async savePurchaseHistory(
    userId: string,
    items: ShoppingHistoryItem[],
    totalAmount: number
  ): Promise<void> {
    const colRef = HistoryService.getCollection(userId);
    await addDoc(colRef, {
      items: items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        quantity: i.quantity,
        priceAtPurchase: i.priceAtPurchase,
      })),
      totalAmount,
      datePurchased: serverTimestamp(),
    });
  }

  static async clearPurchaseHistory(userId: string): Promise<void> {
    const colRef = HistoryService.getCollection(userId);
    const snap = await getDocs(colRef);
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}
