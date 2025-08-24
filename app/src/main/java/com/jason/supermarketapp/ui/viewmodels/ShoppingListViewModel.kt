package com.jason.supermarketapp.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.asLiveData
import androidx.lifecycle.viewModelScope
import com.jason.supermarketapp.data.repositories.ShoppingListRepository
import kotlinx.coroutines.launch
import com.google.firebase.auth.FirebaseAuth

class ShoppingListViewModel : ViewModel() {

    private val repository = ShoppingListRepository()

    private val userId: String
        get() = FirebaseAuth.getInstance().currentUser?.uid ?: "default_user"

    // Expose the list of wishlist items as LiveData
    val shoppingListItems = repository.getShoppingListItems(userId).asLiveData()

    /** Remove a product from the shopping list by its ID
     *
     * @param productId The ID of the product to remove
     */
    fun removeProductFromShoppingList(productId: String) {
        viewModelScope.launch {
            repository.removeShoppingListItem(userId, productId)
        }
    }

    /** Increment the quantity of a product in the shopping list
     *
     * @param productId The ID of the product to increment
     * @param amount The amount to increment by (default is 1)
     */
    fun incrementQuantity(productId: String, amount: Int = 1) {
        viewModelScope.launch {
            repository.addOrUpdateShoppingListItem(userId, productId, amount)
        }
    }

    /** Decrement the quantity of a product in the shopping list
     *
     * @param productId The ID of the product to decrement
     */
    fun decrementQuantity(productId: String) {
        viewModelScope.launch {
            val items = shoppingListItems.value ?: return@launch
            val currentQuantity = items.find { it.first.id == productId }?.second ?: return@launch
            val newQuantity = (currentQuantity - 1).coerceAtLeast(1)
            repository.updateShoppingListItemQuantity(userId, productId, newQuantity)
        }
    }

    /** Clear all items from the shopping list */
    fun clearShoppingList() {
        viewModelScope.launch {
            repository.clearShoppingList(userId)
        }
    }
}