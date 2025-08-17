package com.jason.supermarketapp.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jason.supermarketapp.data.repositories.WishlistRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class ProductDetailsViewModel : ViewModel() {

    private val wishlistRepository = WishlistRepository()

    private val _isInWishlist = MutableStateFlow(false)
    val isInWishlist: StateFlow<Boolean> = _isInWishlist.asStateFlow()

    fun checkWishlistStatus(productId: String) {
        viewModelScope.launch {
            wishlistRepository.getWishlistItem(productId).collect { item ->
                _isInWishlist.value = item != null
            }
        }
    }

    fun addToWishlist(productId: String) {
        viewModelScope.launch {
            wishlistRepository.addWishlistItem(productId)
            _isInWishlist.value = true
        }
    }

    fun removeFromWishlist(productId: String) {
        viewModelScope.launch {
            wishlistRepository.removeWishlistItem(productId)
            _isInWishlist.value = false
        }
    }
}