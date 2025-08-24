package com.jason.supermarketapp.data.repositories

import com.jason.supermarketapp.data.entities.Product
import com.jason.supermarketapp.data.firestore.FirestoreManager
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine

class ShoppingListRepository {

    private val firestoreManager = FirestoreManager()

    /** Return products in shopping list with their quantities
     *
     * @param userId ID of the user whose shopping list is to be fetched
     * @return Flow of List of Pairs, where each Pair contains a Product and its quantity in the shopping list
     */
    fun getShoppingListItems(userId: String): Flow<List<Pair<Product, Int>>> {
        return combine(
            firestoreManager.getProducts(), // Flow<List<Product>>
            firestoreManager.getRawShoppingListItems(userId) // Flow<List<Map<String, Any>>>
        ) { allProducts, rawItems ->
            rawItems.mapNotNull { raw ->
                val productId = raw["productId"] as? String ?: return@mapNotNull null
                val quantity = (raw["productQuantity"] as? Long)?.toInt() ?: 1

                val product = allProducts.find { it.id == productId }
                product?.let { it to quantity }
            }
        }
    }

    /** Add a product to the shopping list or update its quantity if it already exists.
     *
     * @param userId ID of the user
     * @param productId ID of the product to add or update
     * @param quantity Quantity to set for the product (default is 1)
     *
     * @throws Exception if adding/updating in Firestore fails
     */
    suspend fun addOrUpdateShoppingListItem(userId: String, productId: String, quantity: Int = 1) {
        firestoreManager.addOrUpdateShoppingListItem(userId, productId, quantity)
    }

    /** Update the quantity of a specific item in the shopping list.
     *
     * @param userId ID of the user
     * @param productId ID of the product to update
     * @param newQuantity New quantity to set for the product
     *
     * @throws Exception if updating in Firestore fails
     */
    suspend fun updateShoppingListItemQuantity(userId: String, productId: String, newQuantity: Int) {
        firestoreManager.updateShoppingListItemQuantity(userId, productId, newQuantity)
    }

    /** Remove a specific item from the shopping list.
     *
     * @param userId ID of the user
     * @param productId ID of the product to remove
     *
     * @throws Exception if removing from Firestore fails
     */
    suspend fun removeShoppingListItem(userId: String, productId: String) {
        firestoreManager.removeShoppingListItem(userId, productId)
    }

    /** Clear all items from the shopping list.
     *
     * @param userId ID of the user
     *
     * @throws Exception if clearing in Firestore fails
     */
    suspend fun clearShoppingList(userId: String) {
        firestoreManager.clearShoppingList(userId)
    }
}
