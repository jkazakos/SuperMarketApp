package com.jason.supermarketapp.data.entities

import com.google.firebase.firestore.DocumentId

/**
 * Data class representing an item in the user's shopping list.
 * Each item references a product by its ID and includes the desired quantity.
 */
data class ShoppingListItem(
    @DocumentId
    val id: String = "",
    val productId: Int,
    val productQuantity: Int = 1
)