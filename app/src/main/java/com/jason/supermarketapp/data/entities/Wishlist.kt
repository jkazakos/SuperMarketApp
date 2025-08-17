package com.jason.supermarketapp.data.entities

import com.google.firebase.firestore.DocumentId

data class WishListItem(
    // The @DocumentId annotation tells Firebase to use this field for the document's ID
    @DocumentId
    val id: String = "",
    val productId: String = ""
)