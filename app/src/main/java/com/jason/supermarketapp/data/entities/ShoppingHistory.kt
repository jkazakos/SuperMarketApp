package com.jason.supermarketapp.data.entities

import com.google.firebase.firestore.DocumentId

data class ShoppingHistoryItem(
    @DocumentId
    val id: String = "",
    val productId: Int,
    val quantity: Int,
    val priceAtPurchase: Double,
    val datePurchased: Long = System.currentTimeMillis()
)