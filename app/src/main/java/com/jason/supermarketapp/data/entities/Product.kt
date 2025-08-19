package com.jason.supermarketapp.data.entities

import android.os.Parcelable
import com.google.firebase.firestore.DocumentId
import kotlinx.parcelize.Parcelize

@Parcelize
data class Product(
    @DocumentId
    var id: String = "",
    val categoryResId: Int = 0,
    val nameResId: Int = 0,
    val descriptionResId: Int = 0,
    val price: Double = 0.0,
    val onSale: Boolean = false,
    val discount: Double = 0.0,
    val quantityAvailable: Int = 0,
    val imageResId: Int = 0,
    val imageUrl: String = "" // Field to store image URL for remote images
) : Parcelable
