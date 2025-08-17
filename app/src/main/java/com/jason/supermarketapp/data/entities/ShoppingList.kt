package com.jason.supermarketapp.data.entities

import com.google.firebase.firestore.DocumentId

data class ShoppingListItem(
    @DocumentId
    val id: String = "",
    val productId: Int,
    val quantity: Int = 1
)