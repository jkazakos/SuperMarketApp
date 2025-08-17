package com.jason.supermarketapp.data.entities

import android.os.Parcelable
import com.google.firebase.firestore.DocumentId
import com.jason.supermarketapp.R
import kotlinx.parcelize.Parcelize

@Parcelize
data class Product(
    @DocumentId
    var id: String = "",
    val category: String = "",
    val nameResId: Int = 0,
    val descriptionResId: Int = 0,
    val price: Double = 0.0,
    val onSale: Boolean = false,
    val discount: Double = 0.0,
    val quantityAvailable: Int = 0,
    val imageResId: Int = 0,
    val imageUrl: String = "" // Field to store image URL for remote images
) : Parcelable

fun createSampleProduct() {
    val applesProduct = Product(
        id = "product_001",
        category = "beverages",
        nameResId = R.string.product_apples,
        descriptionResId = R.string.apples_desc,
        price = 4.99,
        onSale = false,
        discount = 0.0,
        quantityAvailable = 100,
        imageResId = R.drawable.apples,
        imageUrl = "" // No URL needed for a local image
    )
}