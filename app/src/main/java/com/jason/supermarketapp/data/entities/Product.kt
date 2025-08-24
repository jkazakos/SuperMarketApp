package com.jason.supermarketapp.data.entities

import android.os.Parcelable
import com.google.firebase.firestore.DocumentId
import kotlinx.parcelize.Parcelize

/**
 * Data class representing a product in the supermarket app.
 * Supports localization for name, description, and category fields.
 */
@Parcelize
data class Product(
    @DocumentId
    var id: String = "",
    // Translatable fields stored as language maps
    val name: Map<String, String> = emptyMap(),
    val description: Map<String, String> = emptyMap(),
    val category: Map<String, String> = emptyMap(),
    val price: Double = 0.0,
    val onSale: Boolean = false,
    val discount: Double = 0.0,
    val quantityAvailable: Int = 0,
    val imageUrl: String = "" // Field to store image URL for remote images
) : Parcelable {
    /**
     * Get the localized name based on the provided locale.
     * Defaults to English ("en") if the specified locale is not available.
     */
    fun getLocalizedName(locale: String = java.util.Locale.getDefault().language): String {
        return name[locale] ?: name["en"] ?: ""
    }

    /**
     * Get the localized description based on the provided locale.
     * Defaults to English ("en") if the specified locale is not available.
     */
    fun getLocalizedDescription(locale: String = java.util.Locale.getDefault().language): String {
        return description[locale] ?: description["en"] ?: ""
    }

    /**
     * Get the localized category based on the provided locale.
     * Defaults to English ("en") if the specified locale is not available.
     */
    fun getLocalizedCategory(locale: String = java.util.Locale.getDefault().language): String {
        return category[locale] ?: category["en"] ?: ""
    }
}
