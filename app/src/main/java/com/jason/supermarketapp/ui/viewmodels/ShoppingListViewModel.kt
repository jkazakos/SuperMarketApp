package com.jason.supermarketapp.ui.viewmodels

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.asLiveData
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import kotlinx.coroutines.flow.onStart
import kotlinx.coroutines.flow.onEach
import com.jason.supermarketapp.data.repositories.ShoppingListRepository
import kotlinx.coroutines.flow.catch
import com.google.firebase.auth.FirebaseAuth

class ShoppingListViewModel : ViewModel() {

    private val repository = ShoppingListRepository()
    private val _isLoading = MutableLiveData(true)
    val isLoading: LiveData<Boolean> get() = _isLoading

    private val userId: String
        get() = FirebaseAuth.getInstance().currentUser?.uid ?: "default_user"

    // Expose the list of wishlist items as LiveData with error handling
    val shoppingListItems = repository.getShoppingListItems(userId)
        .catch { e ->
            Log.e("ShoppingList", "Error collecting shopping list items: ${e.message}", e)
            emit(emptyList()) // fallback so UI doesn't break
        }
        .onStart { _isLoading.postValue(true) }  // show loading before first emission
        .onEach { _isLoading.postValue(false) } // hide loading after first emission
        .asLiveData()



    /** Increment the quantity of a product in the shopping list
     *
     * @param productId The ID of the product to increment
     * @param amount The amount to increment by (default is 1)
     */
    suspend fun incrementQuantity(productId: String, amount: Int = 1): Boolean {
        return repository.addOrUpdateShoppingListItem(userId, productId, amount)
    }

    /** Decrement the quantity of a product in the shopping list
     *
     * @param productId The ID of the product to decrement
     */
    suspend fun decrementQuantity(productId: String, newQuantity: Int): Boolean {
        return if (newQuantity > 0) {
            repository.updateShoppingListItemQuantity(userId, productId, newQuantity)
        } else {
            repository.removeShoppingListItem(userId, productId)
        }
    }

    /** Clear all items from the shopping list */
    suspend fun clearShoppingList(): Boolean {
        return repository.clearShoppingList(userId)
    }
}
