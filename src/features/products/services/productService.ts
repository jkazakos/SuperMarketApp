import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
} from 'firebase/firestore';
import { db } from '@/core/config/firebase';
import { Product } from '../types';

export class ProductService {
  private static parseProduct(id: string, data: any): Product {
    return {
      id,
      name: (typeof data.name === 'object' && data.name) || {},
      description: (typeof data.description === 'object' && data.description) || {},
      category: (typeof data.category === 'object' && data.category) || {},
      price: Number(data.price) || 0,
      onSale: Boolean(data.onSale),
      discount: Number(data.discount) || 0,
      quantityAvailable: Number(data.quantityAvailable) || 0,
      imageUrl: String(data.imageUrl || ''),
    };
  }

  static watchProducts(callback: (products: Product[]) => void) {
    const productsRef = collection(db, 'products');
    return onSnapshot(
      productsRef,
      (snapshot) => {
        const products = snapshot.docs.map((d) =>
          ProductService.parseProduct(d.id, d.data())
        );
        callback(products);
      },
      (error) => {
        console.error('Error listening to products:', error);
        callback([]);
      }
    );
  }

  static async getProductById(productId: string): Promise<Product | null> {
    const docRef = doc(db, 'products', productId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return ProductService.parseProduct(snap.id, snap.data());
  }

  static async decreaseProductQuantity(
    productId: string,
    quantity: number
  ): Promise<boolean> {
    const docRef = doc(db, 'products', productId);
    try {
      return await runTransaction(db, async (transaction) => {
        const productSnap = await transaction.get(docRef);
        if (!productSnap.exists()) {
          throw new Error('Product does not exist');
        }

        const data = productSnap.data();
        const currentQty = Number(data.quantityAvailable) || 0;

        if (currentQty < quantity) {
          throw new Error('Not enough stock available');
        }

        transaction.update(docRef, {
          quantityAvailable: currentQty - quantity,
        });

        return true;
      });
    } catch (e) {
      console.error(`Failed to decrease quantity for product ${productId}:`, e);
      return false;
    }
  }
}
