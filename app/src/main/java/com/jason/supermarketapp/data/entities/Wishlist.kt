package com.jason.supermarketapp.data.entities

import com.google.firebase.firestore.DocumentId

/**
 * Data class representing an item in the user's wishlist.
 * Each item references a product by its ID.
 */
data class WishListItem(
    @DocumentId
    val id: String = "",
    val productId: String = ""
)