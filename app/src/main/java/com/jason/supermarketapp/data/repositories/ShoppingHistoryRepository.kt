package com.jason.supermarketapp.data.repositories

import com.jason.supermarketapp.data.entities.Product
import com.jason.supermarketapp.data.entities.ShoppingHistory
import com.jason.supermarketapp.data.firestore.FirestoreManager

/**
 * Repository for managing shopping history operations.
 * This includes saving and retrieving purchase history from Firestore.
 */
class ShoppingHistoryRepository {

    private val firestoreManager = FirestoreManager()

    /**
     * Save the current shopping list as a purchase history for the user.
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

}
