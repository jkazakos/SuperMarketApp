package com.jason.supermarketapp.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jason.supermarketapp.R
import com.jason.supermarketapp.data.repositories.ShoppingListRepository
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
    private val shoppingListRepository = ShoppingListRepository()

    private val _isInWishlist = MutableStateFlow(false)
    val isInWishlist: StateFlow<Boolean> = _isInWishlist.asStateFlow()
    private val _showAddQuantityDialog = MutableSharedFlow<String>() // emits productId
    val showAddQuantityDialog: SharedFlow<String> = _showAddQuantityDialog
    private val _uiMessage = MutableSharedFlow<Int>()
    val uiMessage: SharedFlow<Int> = _uiMessage.asSharedFlow()

    /** Check if a product is in the user's wishlist
     *
     * Updates the isInWishlist StateFlow based on the current status
     * @param userId The ID of the user
     * @param productId The ID of the product to check
     */
    fun checkWishlistStatus(userId: String, productId: String) {
        viewModelScope.launch {
            wishlistRepository.isProductInWishlistFlow(userId, productId)
                .collectLatest { isProductInWishlist ->
                    _isInWishlist.value = isProductInWishlist
                }
        }
    }

    /** Toggle the wishlist status of a product for a user
     *
     * If the product is already in the wishlist, it will be removed.
     * If the product is not in the wishlist, it will be added.
     * Emits a UI message upon successful addition or removal
     * @param userId The ID of the user
     * @param productId The ID of the product to toggle
     */
    fun toggleWishlistStatus(userId: String, productId: String) {
        viewModelScope.launch {
            val isInWishlist = isInWishlist.value
            val success = if (isInWishlist) {
                wishlistRepository.removeWishlistItem(userId, productId)
            } else {
                wishlistRepository.addWishlistItem(userId, productId)
            }

            if (success) {
                _uiMessage.emit(
                    if (isInWishlist) R.string.removed_from_wishlist
                    else R.string.added_to_wishlist
                )
            } else {
                _uiMessage.emit(R.string.generic_error)
            }
        }
    }


    /** Trigger the display of a dialog to add a product to the shopping list
     *
     * Emits the productId to be added to the shopping list
     * @param productId The ID of the product to add
     */
    fun toggleShoppingListStatus(productId: String) {
        viewModelScope.launch {
            _showAddQuantityDialog.emit(productId)

        }
    }

    /** Add or update product in shopping list with specified quantity
     *
     * Emits a UI message upon successful addition or update
     * @param userId The ID of the user
     * @param productId The ID of the product to add or update
     * @param quantity The quantity of the product to add or update
     */
    fun addProductToShoppingList(userId: String, productId: String, quantity: Int) {
        viewModelScope.launch {
            val success = shoppingListRepository.addOrUpdateShoppingListItem(userId, productId, quantity)
            if (success) {
                _uiMessage.emit(R.string.added_to_shopping_list)
            } else {
                _uiMessage.emit(R.string.failed_to_add_to_shopping_list)
            }
        }
    }
}