package com.jason.supermarketapp.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jason.supermarketapp.R
import com.jason.supermarketapp.data.repositories.WishlistRepository
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

class ProductDetailsViewModel : ViewModel() {

    private val wishlistRepository = WishlistRepository()

    private val _isInWishlist = MutableStateFlow(false)
    val isInWishlist: StateFlow<Boolean> = _isInWishlist.asStateFlow()
    private val _uiMessage = MutableSharedFlow<Int>()
    val uiMessage: SharedFlow<Int> = _uiMessage.asSharedFlow()

    fun checkWishlistStatus(productId: String) {
        viewModelScope.launch {
            wishlistRepository.isProductInWishlistFlow(productId)
                .collectLatest { isProductInWishlist ->
                    _isInWishlist.value = isProductInWishlist
                }
            }
    }

    fun toggleWishlistStatus(productId: String) {
        viewModelScope.launch {
            val isInWishlist = isInWishlist.value
            if (isInWishlist) {
                wishlistRepository.removeWishlistItem(productId)
                _uiMessage.emit(R.string.removed_from_wishlist)
            } else {
                wishlistRepository.addWishlistItem(productId)
                _uiMessage.emit(R.string.added_to_wishlist)
            }
        }
    }
}