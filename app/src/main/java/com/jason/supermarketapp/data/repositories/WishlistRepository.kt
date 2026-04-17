package com.jason.supermarketapp.data.repositories

import com.jason.supermarketapp.data.entities.Product
import com.jason.supermarketapp.data.firestore.FirestoreManager
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine

class WishlistRepository {

    // Firestore manager instance to handle Firestore operations
    private val firestoreManager = FirestoreManager()

    /** Get the wishlist items for a specific user
     *
     * This method combines the flow of all products with the flow of raw wishlist items
     * to produce a flow of products that are in the user's wishlist.
     * @param userId The ID of the user whose wishlist items are to be retrieved.
     * @return A Flow emitting a list of Products that are in the user's wishlist.
     */
    fun getWishlistItems(userId:String): Flow<List<Product>> {
        // We get both flows from the FirestoreManager
        return combine(
            // Use the Flow of products
            firestoreManager.getProducts(),
            // Use the Flow of raw wishlist documents
            firestoreManager.getRawWishlistItems(userId)
        ) { allProducts, rawWishlistItems ->
            val productIdsInWishlist = rawWishlistItems.mapNotNull { it["productId"] as? String }
            allProducts.filter { productIdsInWishlist.contains(it.id) }
        }
    }

    /** Add a product to the wishlist
     *
     * This method adds a product to the user's wishlist by delegating to the FirestoreManager.
     * @param userId The ID of the user whose wishlist is to be updated.
     * @param productId The ID of the product to be added to the wishlist.
     */
    suspend fun addWishlistItem(userId:String, productId: String): Boolean {
        return firestoreManager.addWishlistItem(userId, productId)
    }

    /** Remove a product from the wishlist
     *
     * This method removes a product from the user's wishlist by delegating to the FirestoreManager.
     * @param userId The ID of the user whose wishlist is to be updated.
     * @param productId The ID of the product to be removed from the wishlist.
     */
    suspend fun removeWishlistItem(userId:String, productId: String): Boolean {
        return firestoreManager.removeWishlistItem(userId, productId)
    }

    /** Check if a product is in the wishlist with a Flow
     *
     * This method checks if a product is in the user's wishlist by delegating to the FirestoreManager.
     * It returns a Flow that emits true if the product is in the wishlist, false otherwise.
     * @param userId The ID of the user whose wishlist is to be checked.
     * @param productId The ID of the product to check for in the wishlist.
     * @return A Flow emitting a Boolean indicating whether the product is in the wishlist.
     */
    fun isProductInWishlistFlow(userId:String, productId: String): Flow<Boolean> {
        return firestoreManager.isProductInWishlistFlow(userId, productId)
    }

    /** Clear all items from the wishlist
     *
     * This method clears all items from the user's wishlist by delegating to the FirestoreManager.
     * @param userId The ID of the user whose wishlist is to be cleared.
     */
    suspend fun clearWishlist(userId:String): Boolean {
        return firestoreManager.clearWishlist(userId)
    }

}
