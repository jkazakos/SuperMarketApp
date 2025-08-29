package com.jason.supermarketapp.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.asLiveData
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.jason.supermarketapp.data.repositories.WishlistRepository
import kotlinx.coroutines.launch
import com.google.firebase.auth.FirebaseAuth
import com.jason.supermarketapp.R
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.flow.onStart

class WishlistViewModel : ViewModel() {

    private val repository = WishlistRepository()
    private val _uiMessage = MutableSharedFlow<Int>()
    val uiMessage = _uiMessage.asSharedFlow()
    // Track loading state
    private val _isLoading = MutableLiveData(true)
    val isLoading: LiveData<Boolean> get() = _isLoading

    private val userId: String
        get() = FirebaseAuth.getInstance().currentUser?.uid ?: "default_user"

    // Expose the list of wishlist items as LiveData
    val wishlistItems = repository.getWishlistItems(userId)
        .onStart { _isLoading.postValue(true) }  // Show loading before items emit
        .onEach { _isLoading.postValue(false) } // Hide loading after first emit
        .asLiveData()


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
            val success = repository.clearWishlist(userId)
            if (success) {
                _uiMessage.emit(R.string.wishlist_cleared)
            } else {
                _uiMessage.emit(R.string.generic_error)
            }
        }
    }

}