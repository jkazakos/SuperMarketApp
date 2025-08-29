package com.jason.supermarketapp.data.repositories

import com.jason.supermarketapp.data.entities.Product
import com.jason.supermarketapp.data.entities.ShoppingHistory
import com.jason.supermarketapp.data.firestore.FirestoreManager

/**
 * Repository for managing shopping history operations.
 * This includes saving and retrieving purchase history from Firestore.
 */
class ShoppingHistoryRepository {

    // Firestore manager instance to handle Firestore operations
    private val firestoreManager = FirestoreManager()

    /**
     * Save the current shopping list in the purchase history of the user.
     *
     * @param userId ID of the user
     * @param shoppingList List of Pairs, where each Pair contains a Product and its quantity
     * @param totalAmount Total amount spent in this purchase
     * @return true if the operation was successful, false otherwise
     * @throws Exception if saving to Firestore fails
     */
    suspend fun savePurchaseHistory(userId: String, shoppingList: List<Pair<Product, Int>>, totalAmount: Double): Boolean {
        return firestoreManager.savePurchaseHistory(userId, shoppingList, totalAmount)
    }

    /** Delete all shopping history for a user.
     *
     * @param userId ID of the user
     * @return true if the operation was successful, false otherwise
     */
    suspend fun clearPurchaseHistory(userId: String): Boolean {
        return firestoreManager.clearPurchaseHistory(userId)
    }

    /** Retrieve the purchase history for a user.
     *
     * @param userId ID of the user
     * @return List of ShoppingHistory objects representing the user's purchase history
     */
    suspend fun getPurchaseHistory(userId: String): List<ShoppingHistory> {
        return firestoreManager.getPurchaseHistory(userId)
    }

    /** Retrieve a specific shopping history entry by its ID.
     *
     * @param userId ID of the user
     * @param historyId ID of the shopping history entry
     * @return ShoppingHistory object if found, null otherwise
     */
    suspend fun getShoppingHistoryById(userId: String, historyId: String): ShoppingHistory? {
        return firestoreManager.getShoppingHistoryById(userId, historyId)
    }

    /** Retrieve a map of product IDs to their image URLs.
     *
     * @param productIds List of product IDs to fetch images for
     * @return Map where keys are product IDs and values are image URLs
     */
    suspend fun getProductImagesMap(productIds: List<String>): Map<String, String> {
        return firestoreManager.getProductImagesMap(productIds)
    }

    /** Decrease the stock quantity of a product.
     *
     * @param productId ID of the product
     * @param quantity Amount to decrease
     * @return true if the operation was successful, false otherwise
     */
    suspend fun decreaseProductQuantity(productId: String, quantity: Int): Boolean {
        return firestoreManager.decreaseProductQuantity(productId, quantity)
    }

}
