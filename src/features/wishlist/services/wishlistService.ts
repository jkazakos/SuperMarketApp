import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/core/config/firebase';

export class WishlistService {
  private static getCollection(userId: string) {
    return collection(db, 'users', userId, 'wishlist');
  }

  static watchWishlistProductIds(
    userId: string,
    callback: (productIds: string[]) => void
  ) {
    const colRef = WishlistService.getCollection(userId);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const ids = snapshot.docs.map((d) => d.id);
        callback(ids);
      },
      (error) => {
        console.error('Error listening to wishlist:', error);
        callback([]);
      }
    );
  }

  static async addWishlistItem(userId: string, productId: string): Promise<void> {
    const docRef = doc(db, 'users', userId, 'wishlist', productId);
    await setDoc(docRef, { productId });
  }

  static async removeWishlistItem(userId: string, productId: string): Promise<void> {
    const docRef = doc(db, 'users', userId, 'wishlist', productId);
    await deleteDoc(docRef);
  }

  static async clearWishlist(userId: string): Promise<void> {
    const colRef = WishlistService.getCollection(userId);
    const snap = await getDocs(colRef);
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}
