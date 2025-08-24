package com.jason.supermarketapp.data.entities

import android.os.Parcelable
import com.google.firebase.Timestamp
import com.google.firebase.firestore.DocumentId
import kotlinx.parcelize.Parcelize

/**
 * Data class representing an item in the shopping list that was purchased.
 * This is a snapshot of the product details at the time of purchase.
 */
@Parcelize
data class ShoppingHistoryItem(
    val productId: String = "",
    val productName: Map<String, String> = emptyMap(),  // snapshot of localized names
    val quantity: Int = 0,
    val priceAtPurchase: Double = 0.0
) : Parcelable {

    /**
     * Get the localized name based on the provided locale.
     * Defaults to English ("en") if the specified locale is not available.
     */
    fun getLocalizedName(locale: String = java.util.Locale.getDefault().language): String {
        return productName[locale] ?: productName["en"] ?: ""
    }
}

/**
 * Data class representing a shopping history record.
 * Each record corresponds to a completed purchase.
 */
data class ShoppingHistory(
    @DocumentId
    val id: String = "", // Purchased shopping list ID
    val items: List<ShoppingHistoryItem> = emptyList(), // List of items purchased
    val totalAmount: Double = 0.0, // Total amount spent
    val datePurchased: Timestamp? = null // Firestore server timestamp
)
