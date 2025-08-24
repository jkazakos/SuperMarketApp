package com.jason.supermarketapp.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.asLiveData
import androidx.lifecycle.viewModelScope
import com.jason.supermarketapp.data.repositories.WishlistRepository
import kotlinx.coroutines.launch
import com.google.firebase.auth.FirebaseAuth

class WishlistViewModel : ViewModel() {

    private val repository = WishlistRepository()

    private val userId: String
        get() = FirebaseAuth.getInstance().currentUser?.uid ?: "default_user"

    // Expose the list of wishlist items as LiveData
    val wishlistItems = repository.getWishlistItems(userId).asLiveData()

    /** Remove a product from the wishlist by its ID
     *
     * @param productId The ID of the product to be removed from the wishlist
     */
    fun removeProductFromWishlist(productId: String) {
        viewModelScope.launch {
            repository.removeWishlistItem(userId, productId)
        }
    }

    /** Clear all items from the wishlist */
    fun clearWishlist() {
        viewModelScope.launch {
            repository.clearWishlist(userId)
        }
    }
}