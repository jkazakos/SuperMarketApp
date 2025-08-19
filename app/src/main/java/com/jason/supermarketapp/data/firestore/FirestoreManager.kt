package com.jason.supermarketapp.data.firestore

import android.util.Log
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.snapshots
import com.jason.supermarketapp.data.entities.Product
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.tasks.await

class FirestoreManager {

    private val firestore = FirebaseFirestore.getInstance()
    private val productsCollection = firestore.collection("products")
    private val wishlistCollection = firestore.collection("wishlist")

    // Get all products from Firestore
    fun getProducts(): Flow<List<Product>> {
        return productsCollection.snapshots().map { snapshot -> snapshot.documents.mapNotNull { it.toObject(Product::class.java) }
        }
    }

    // Add a product to Firestore
    suspend fun addProduct(product: Product) {
        productsCollection.document(product.id)
            .set(product)
            .addOnSuccessListener {
                Log.d("FirestoreManager", "Product added with ID: ${product.id}")
            }
            .addOnFailureListener { e ->
                Log.w("FirestoreManager", "Error adding document", e)
            }.await() // Use await() to make this a suspending function
    }

    // Check if a product exists in the database
    suspend fun productExists(productId: String): Boolean {
        return productsCollection.document(productId).get().await().exists()
    }

    // Get all distinct product categories
    fun getCategories(): Flow<Set<Int>> {
        return productsCollection.snapshots().map { snapshot -> snapshot.documents.mapNotNull { it.getLong("categoryResId")?.toInt() }.toSet()
        }
    }

    // Get the full list of products in the wishlist
    fun getRawWishlistItems(): Flow<List<Map<String, Any>>> {
        return wishlistCollection.snapshots().map { snapshot -> snapshot.documents.map { it.data ?: emptyMap() }
        }
    }

    // Add a product to the wishlist
    suspend fun addWishlistItem(productId: String) {
        val newItem = hashMapOf("productId" to productId)
        wishlistCollection.document().set(newItem).await()

    }

    // Remove a product from the wishlist
    suspend fun removeWishlistItem(productId: String) {
        val querySnapshot = wishlistCollection.whereEqualTo("productId", productId).get().await()
        for (document in querySnapshot.documents) { document.reference.delete().await() }
    }

    // Perform a one-time check to see if a product is in the wishlist
    suspend fun isProductInWishlist(productId: String): Boolean {
        return try {
            val documentSnapshot = wishlistCollection.document(productId).get().await()
            documentSnapshot.exists()
        } catch (e: Exception) {
            Log.e("FirestoreManager", "Error checking wishlist status for $productId", e)
            false
        }
    }

    // Get a real-time stream to check if a product is in the wishlist
    fun isProductInWishlistFlow(productId: String): Flow<Boolean> = callbackFlow {
        val listenerRegistration = wishlistCollection
            .whereEqualTo("productId", productId)
            .addSnapshotListener { querySnapshot, e ->
                if (e != null) {
                    close(e)
                    return@addSnapshotListener
                }
                // Check if the query result is not empty
                trySend(!querySnapshot!!.isEmpty)
            }

        awaitClose { listenerRegistration.remove() }
    }

    // Clear the entire wishlist
    suspend fun clearWishlist() {
        val batch = firestore.batch()
        val querySnapshot = wishlistCollection.get().await()
        for (document in querySnapshot.documents) {
            batch.delete(document.reference)
        }
        batch.commit().await()
    }

}