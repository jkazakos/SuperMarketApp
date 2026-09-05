import {
  collection,
  doc,
  deleteDoc,
  getDocs,
  writeBatch,
  onSnapshot,
  runTransaction,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/core/config/firebase';
import { ShoppingListItem } from '../types';

export class ShoppingListService {
  private static getCollection(userId: string) {
    return collection(db, 'users', userId, 'shoppingList');
  }

  static watchShoppingListItems(userId: string, callback: (items: ShoppingListItem[]) => void) {
    const colRef = ShoppingListService.getCollection(userId);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items: ShoppingListItem[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            productId: data.productId || d.id,
            productQuantity: Number(data.productQuantity) || 1,
          };
        });
        callback(items);
      },
      (error) => {
        console.error('Error listening to shopping list:', error);
        callback([]);
      }
    );
  }

  static async addOrUpdateItem(userId: string, productId: string, quantity: number): Promise<void> {
    const docRef = doc(db, 'users', userId, 'shoppingList', productId);
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(docRef);
      if (snap.exists()) {
        const current = Number(snap.data().productQuantity) || 0;
        transaction.update(docRef, { productQuantity: current + quantity });
      } else {
        transaction.set(docRef, { productId, productQuantity: quantity });
      }
    });
  }

  static async updateQuantity(
    userId: string,
    productId: string,
    newQuantity: number
  ): Promise<void> {
    const docRef = doc(db, 'users', userId, 'shoppingList', productId);
    if (newQuantity <= 0) {
      await deleteDoc(docRef);
    } else {
      await updateDoc(docRef, { productQuantity: newQuantity });
    }
  }

  static async removeItem(userId: string, productId: string): Promise<void> {
    const docRef = doc(db, 'users', userId, 'shoppingList', productId);
    await deleteDoc(docRef);
  }

  static async clearShoppingList(userId: string): Promise<void> {
    const colRef = ShoppingListService.getCollection(userId);
    const snap = await getDocs(colRef);
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}
