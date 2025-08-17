package com.jason.supermarketapp.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.asLiveData
import androidx.lifecycle.viewModelScope
import com.jason.supermarketapp.data.repositories.WishlistRepository
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch

class WishlistViewModel : ViewModel() {

    private val repository = WishlistRepository()

    // Expose the list of wishlist items as LiveData
    val wishlistItems = repository.getWishlistItems().asLiveData()

    // Function to remove a product from the wishlist by its ID
    fun removeProductFromWishlist(productId: String) {
        viewModelScope.launch {
            repository.removeWishlistItem(productId)
        }
    }

    fun clearWishlist() {
        viewModelScope.launch {
            repository.clearWishlist()
        }
    }
}