package com.jason.supermarketapp.data.repositories

import com.jason.supermarketapp.data.entities.Product
import com.jason.supermarketapp.data.firestore.FirestoreManager
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine

class WishlistRepository {

    private val firestoreManager = FirestoreManager()

    // Get the full list of products in the wishlist as entities
    fun getWishlistItems(): Flow<List<Product>> {
        // We get both flows from the FirestoreManager
        return combine(
            // Use the Flow of products
            firestoreManager.getProducts(),
            // Use the Flow of raw wishlist documents
            firestoreManager.getRawWishlistItems()
        ) { allProducts, rawWishlistItems ->
            val productIdsInWishlist = rawWishlistItems.mapNotNull { it["productId"] as? String }
            allProducts.filter { productIdsInWishlist.contains(it.id) }
        }
    }

    // Add product to the wishlist
    suspend fun addWishlistItem(productId: String) {
        firestoreManager.addWishlistItem(productId)
    }

    // Remove product from the wishlist
    suspend fun removeWishlistItem(productId: String) {
        firestoreManager.removeWishlistItem(productId)
    }

    // Check if a product is in the wishlist
    fun isProductInWishlistFlow(productId: String): Flow<Boolean> {
        return firestoreManager.isProductInWishlistFlow(productId)
    }

    // New: Check if a product is in the wishlist with a suspend function
    suspend fun isProductInWishlist(productId: String): Boolean {
        return firestoreManager.isProductInWishlist(productId)
    }

    // Clear the wishlist
    suspend fun clearWishlist() {
        firestoreManager.clearWishlist()
    }

}