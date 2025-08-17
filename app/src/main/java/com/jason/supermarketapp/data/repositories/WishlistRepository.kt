package com.jason.supermarketapp.data.repositories

import android.util.Log
import com.google.firebase.Firebase
import com.google.firebase.firestore.firestore
import com.jason.supermarketapp.data.entities.Product
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class WishlistRepository {

    private val firestore = Firebase.firestore
    private val wishlistCollection = firestore.collection("wishlist")
    private val productsCollection = firestore.collection("products")

    fun getWishlistItem(productId: String): Flow<Map<String, Any>?> = callbackFlow {
        val listenerRegistration = wishlistCollection
            .whereEqualTo("productId", productId)
            .addSnapshotListener { snapshot, e ->
                if (e != null) {
                    close(e)
                    return@addSnapshotListener
                }
                if (snapshot != null && !snapshot.isEmpty) {
                    trySend(snapshot.documents.first().data)
                } else {
                    trySend(null)
                }
            }

        awaitClose { listenerRegistration.remove() }
    }

    suspend fun addWishlistItem(productId: String) {
        try {
            val newItem = hashMapOf("productId" to productId)
            wishlistCollection.add(newItem).await()
        } catch (e: Exception) {
            Log.e("WishlistRepo", "Error adding item to wishlist", e)
        }
    }

    suspend fun removeWishlistItem(productId: String) {
        try {
            val querySnapshot = wishlistCollection
                .whereEqualTo("productId", productId)
                .get()
                .await()
            for (document in querySnapshot.documents) {
                document.reference.delete().await()
            }
        } catch (e: Exception) {
            Log.e("WishlistRepo", "Error removing item from wishlist", e)
        }
    }

    // Get the full list of products in the wishlist as entities
    fun getWishlistItems(): Flow<List<Product>> = callbackFlow {
        val listenerRegistration = wishlistCollection.addSnapshotListener { wishlistSnapshot, e ->
            if (e != null) {
                close(e)
                return@addSnapshotListener
            }

            val productIds = wishlistSnapshot?.documents?.mapNotNull { it.getString("productId") } ?: emptyList()
            if (productIds.isEmpty()) {
                trySend(emptyList())
                return@addSnapshotListener
            }

            productsCollection.get()
                .addOnSuccessListener { productSnapshot ->
                    val products = productSnapshot.documents.mapNotNull { doc ->
                        val product = doc.toObject(Product::class.java)
                        product?.apply { id = doc.id }
                    }.filter { it.id in productIds } // only wishlist items
                    trySend(products)
                }
                .addOnFailureListener { close(it) }
        }

        awaitClose { listenerRegistration.remove() }
    }



    fun clearWishlist() {
        wishlistCollection.get().addOnSuccessListener { snapshot ->
            for (document in snapshot.documents) {
                document.reference.delete()
            }
        }.addOnFailureListener { e ->
            Log.e("WishlistRepo", "Error clearing wishlist", e)
        }
    }
}