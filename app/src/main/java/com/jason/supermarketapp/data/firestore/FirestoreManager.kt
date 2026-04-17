package com.jason.supermarketapp.data.firestore

import android.util.Log
import com.google.firebase.Timestamp
import com.google.firebase.firestore.FieldPath
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.FirebaseFirestoreException
import com.google.firebase.firestore.snapshots
import com.jason.supermarketapp.data.entities.Product
import com.jason.supermarketapp.data.entities.ShoppingHistory
import com.jason.supermarketapp.data.entities.ShoppingHistoryItem
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.tasks.await
import java.util.Locale

/** FirestoreManager handles all Firestore operations for products, wishlists, shopping lists, and purchase history. */
class FirestoreManager {

    // Firestore instance
    private val firestore = FirebaseFirestore.getInstance()

    // ---------- PRODUCT METHODS ----------

    // Reference to the products collection
    private val productsCollection = firestore.collection("products")

    /** Get all products from Firestore as a Flow
     *
     * Handles errors gracefully by logging and emitting an empty list on failure.
     * @return A Flow emitting a list of Product objects
     * @throws Exception if fetching from Firestore fails
     * @see Product
     */
    fun getProducts(): Flow<List<Product>> {
        return productsCollection.snapshots().map { snapshot ->
                try {
                    snapshot.documents.mapNotNull { doc ->
                        val product = doc.toObject(Product::class.java)
                        if (product != null) {
                            product.copy(id = doc.id)
                        } else {
                            Log.w("FirestoreManager", "Skipping malformed product document: ${doc.id}")
                            null
                        }
                    }
                } catch (e: Exception) {
                    Log.e("FirestoreManager", "Error mapping products: ${e.message}", e)
                    emptyList()
                }
            }
            .catch { e ->
                Log.e("FirestoreManager", "Error fetching products: ${e.message}", e)
                emit(emptyList())
            }
    }

    /** Add a new product to Firestore
     *
     * Relevant for admin functionality to seed products.
     * @param product The product to add
     * @return True if the product was added successfully, false otherwise
     * @throws Exception if adding to Firestore fails
     */
    suspend fun addProduct(product: Product): Boolean {
        return try {
            productsCollection.document(product.id)
                .set(product)
                .await()
            Log.d("FirestoreManager", "Product added with ID: ${product.id}")
            true
        } catch (e: FirebaseFirestoreException) {
            Log.e("FirestoreManager", "Firestore error adding product ${product.id}: ${e.message}", e)
            false
        } catch (e: Exception) {
            Log.e("FirestoreManager", "Unexpected error adding product ${product.id}: ${e.message}", e)
            false
        }
    }


    /** Check if a product exists by its ID
     *
     * Relevant for admin functionality.
     *
     * @param productId The ID of the product to check
     * @return True if the product exists, false otherwise
     * @throws Exception if checking in Firestore fails
     */
    suspend fun productExists(productId: String): Boolean {
        return try {
            productsCollection.document(productId).get().await().exists()
        } catch (e: FirebaseFirestoreException) {
            Log.e("FirestoreManager", "Firestore error checking product $productId: ${e.message}", e)
            false
        } catch (e: Exception) {
            Log.e("FirestoreManager", "Unexpected error checking product $productId: ${e.message}", e)
            false
        }
    }

    /**Get a list of unique product categories, localized to the specified language.
     *
     * @param locale The locale code (e.g., "en", "es") for localization. Defaults to device's locale.
     * @return A Flow emitting a set of unique category names in the specified locale.
     * @throws Exception if fetching from Firestore fails
     */
    fun getCategories(locale: String = Locale.getDefault().language): Flow<Set<String>> {
        return productsCollection
            .snapshots()
            .map { snapshot ->
                try {
                    snapshot.documents.mapNotNull { doc ->
                        val categoryMap = doc.get("category") as? Map<*, *>
                        categoryMap?.get(locale) as? String
                            ?: categoryMap?.get("en") as? String
                            ?: run {
                                Log.w("FirestoreManager", "Product ${doc.id} has no valid category")
                                null
                            }
                    }.toSet()
                } catch (e: Exception) {
                    Log.e("FirestoreManager", "Error mapping categories: ${e.message}", e)
                    emptySet()
                }
            }
            .catch { e ->
                Log.e("FirestoreManager", "Error fetching categories: ${e.message}", e)
                emit(emptySet())
            }
    }

    // ---------- WISHLIST METHODS ----------

    /** Helper function to get the wishlist collection for a user
     *
     * @param userId The ID of the user
     * @return The Firestore collection reference for the user's wishlist
     */
    private fun getWishlistCollection(userId: String)= firestore.collection("users").document(userId).collection("wishlist")

    /** Get the full wishlist (raw maps)
     *
     * @param userId The ID of the user
     * @return A Flow emitting a list of maps representing wishlist items
     * @throws Exception if fetching from Firestore fails
     */
    fun getRawWishlistItems(userId: String): Flow<List<Map<String, Any>>> {
        return getWishlistCollection(userId)
            .snapshots()
            .map { snapshot ->
                try {
                    snapshot.documents.mapNotNull { doc ->
                        val data = doc.data ?: return@mapNotNull null
                        val productId = data["productId"] as? String

                        if (productId != null) {
                            data.toMap() // keep original fields
                        } else {
                            Log.w("Wishlist", "Skipping invalid wishlist item: $data")
                            null
                        }
                    }
                } catch (e: Exception) {
                    Log.e("Wishlist", "Error mapping wishlist items: ${e.message}", e)
                    emptyList()
                }
            }
            .catch { e ->
                Log.e("Wishlist", "Error fetching wishlist: ${e.message}", e)
                emit(emptyList())
            }
    }


    /** Add a product to the wishlist
     *
     * @param userId The ID of the user
     * @param productId The ID of the product to add to the wishlist
     * @return True if the product was added successfully, false otherwise
     * @throws Exception if adding to Firestore fails
     */
    suspend fun addWishlistItem(userId: String, productId: String): Boolean {
        return try {
            val newItem = hashMapOf("productId" to productId)
            getWishlistCollection(userId)
                .document(productId)
                .set(newItem)
                .await()
            Log.d("Wishlist", "Added wishlist item: $productId")
            true
        } catch (e: FirebaseFirestoreException) {
            Log.e("Wishlist", "Firestore error adding wishlist item $productId: ${e.message}", e)
            false
        } catch (e: Exception) {
            Log.e("Wishlist", "Unexpected error adding wishlist item $productId: ${e.message}", e)
            false
        }
    }

    /** Remove a product from the wishlist
     *
     * @param userId The ID of the user
     * @param productId The ID of the product to remove from the wishlist
     * @return True if the product was removed successfully, false otherwise
     * @throws Exception if removing from Firestore fails
     */
    suspend fun removeWishlistItem(userId: String, productId: String): Boolean {
        return try {
            getWishlistCollection(userId)
                .document(productId)
                .delete()
                .await()
            Log.d("Wishlist", "Removed wishlist item: $productId")
            true
        } catch (e: FirebaseFirestoreException) {
            Log.e("Wishlist", "Firestore error removing wishlist item $productId: ${e.message}", e)
            false
        } catch (e: Exception) {
            Log.e("Wishlist", "Unexpected error removing wishlist item $productId: ${e.message}", e)
            false
        }
    }


    /** Check if a product is in the wishlist as a Flow for real-time updates
     *
     * @param userId The ID of the user
     * @param productId The ID of the product to check
     * @return A Flow emitting true if the product is in the wishlist, false otherwise
     */
    fun isProductInWishlistFlow(userId: String, productId: String): Flow<Boolean> = callbackFlow {
        val listenerRegistration = getWishlistCollection(userId)
            .document(productId)
            .addSnapshotListener { documentSnapshot, e ->
                if (e != null) {
                    Log.e("Wishlist", "Error listening to product $productId: ${e.message}", e)
                    trySend(false).isSuccess
                    return@addSnapshotListener
                }
                runCatching {
                    trySend(documentSnapshot?.exists() ?: false).isSuccess
                }.onFailure { ex ->
                    Log.e("Wishlist", "Error sending wishlist status: ${ex.message}", ex)
                }
            }

        awaitClose { listenerRegistration.remove() }
    }


    /** Clear the entire wishlist for a user
     *
     * @param userId The ID of the user
     */
    suspend fun clearWishlist(userId: String): Boolean {
        return try {
            val batch = firestore.batch()
            val querySnapshot = getWishlistCollection(userId).get().await()
            for (document in querySnapshot.documents) {
                batch.delete(document.reference)
            }
            batch.commit().await()
            Log.d("Wishlist", "Cleared wishlist for user $userId")
            true
        } catch (e: FirebaseFirestoreException) {
            Log.e("Wishlist", "Firestore error clearing wishlist for $userId: ${e.message}", e)
            false
        } catch (e: Exception) {
            Log.e("Wishlist", "Unexpected error clearing wishlist for $userId: ${e.message}", e)
            false
        }
    }

    // ---------- SHOPPING LIST METHODS ----------

    /** Helper function to get the shopping list collection for a user
     *
     * @param userId The ID of the user
     * @return The Firestore collection reference for the user's shopping list
     */
    private fun getShoppingListCollection(userId: String) =
        firestore.collection("users").document(userId).collection("shoppingList")

    /** Get the full shopping list (raw maps)
     *
     * @param userId The ID of the user
     * @return A Flow emitting a list of maps representing shopping list items
     * Handles errors gracefully by logging and emitting an empty list on failure.
     */
    fun getRawShoppingListItems(userId: String): Flow<List<Map<String, Any>>> {
        return getShoppingListCollection(userId)
            .snapshots()
            .map { snapshot ->
                try {
                    snapshot.documents.mapNotNull { doc ->
                        val data = doc.data ?: return@mapNotNull null

                        val productId = data["productId"] as? String
                        val quantity = data["productQuantity"] as? Long

                        if (productId != null && quantity != null) {
                            data.toMap()
                        } else {
                            Log.w("ShoppingList", "Skipping invalid item in shopping list: $data")
                            null
                        }
                    }
                } catch (e: Exception) {
                    Log.e("ShoppingList", "Error mapping shopping list items: ${e.message}", e)
                    emptyList()
                }
            }
            .catch { e ->
                Log.e("ShoppingList", "Error fetching shopping list: ${e.message}", e)
                emit(emptyList())
            }
    }



    /** Add or update a product in the shopping list
     * If the product already exists, increment its quantity.
     * If it doesn't exist, create a new entry with the specified quantity.
     *
     * @param userId The ID of the user
     * @param productId The ID of the product to add or update
     * @param quantity The quantity to add (default is 1)
     * @return True if the operation was successful, false otherwise
     * @throws Exception if adding/updating in Firestore fails
     */
    suspend fun addOrUpdateShoppingListItem(userId: String, productId: String, quantity: Int = 1):Boolean {
        return try {
            val docRef = getShoppingListCollection(userId).document(productId)
            // Running transaction to handle concurrent updates safely
            firestore.runTransaction { transaction ->
                val snapshot = transaction.get(docRef)
                if (snapshot.exists()) {
                    val currentQuantity = snapshot.getLong("productQuantity")?.toInt() ?: 0
                    transaction.update(docRef, "productQuantity", currentQuantity + quantity)
                } else {
                    val newItem = hashMapOf(
                        "productId" to productId,
                        "productQuantity" to quantity
                    )
                    transaction.set(docRef, newItem)
                }
            }.await()

            true
        } catch (e: FirebaseFirestoreException) {
            Log.e("ShoppingList", "Firestore error: ${e.message}")
            false
        } catch (e: Exception) {
            Log.e("ShoppingList", "Unexpected error: ${e.message}")
            false
        }
    }

    /** Update the quantity of a specific product in the shopping list
     *
     * @param userId The ID of the user
     * @param productId The ID of the product to update
     * @param newQuantity The new quantity to set
     * @return True if the operation was successful, false otherwise
     * @throws Exception if updating in Firestore fails
     */
    suspend fun updateShoppingListItemQuantity(userId: String, productId: String, newQuantity: Int): Boolean {
        return try {
            getShoppingListCollection(userId).document(productId)
                .update("productQuantity", newQuantity)
                .await()
            true
        } catch (e: FirebaseFirestoreException) {
            Log.e("ShoppingList", "Firestore error: ${e.message}")
            false
        } catch (e: Exception) {
            Log.e("FirestoreManager", "Error updating quantity for $productId", e)
            false
        }
    }

    /** Remove a product from the shopping list
     *
     * @param userId The ID of the user
     * @param productId The ID of the product to remove
     * @return True if the operation was successful, false otherwise
     * @throws Exception if removing from Firestore fails
     */
    suspend fun removeShoppingListItem(userId: String, productId: String): Boolean {
        return try {
            getShoppingListCollection(userId)
                .document(productId)
                .delete()
                .await()
            true
        } catch (e: FirebaseFirestoreException) {
            Log.e("ShoppingList", "Firestore error: ${e.message}")
            false
        } catch (e: Exception) {
            Log.e("ShoppingList", "Unexpected error: ${e.message}")
            false
        }
    }


    /** Clear the entire shopping list for a user
     *
     * @param userId The ID of the user
     * @return True if the operation was successful, false otherwise
     * @throws Exception if clearing in Firestore fails
     */
    suspend fun clearShoppingList(userId: String): Boolean {
        return try{
            val batch = firestore.batch()
            val querySnapshot = getShoppingListCollection(userId).get().await()
            for (document in querySnapshot.documents) {
                batch.delete(document.reference)
            }
            batch.commit().await()
            true
        } catch (e: FirebaseFirestoreException) {
            Log.e("ShoppingList", "Firestore error while clearing list: ${e.message}")
            false
        } catch (e: Exception) {
            Log.e("FirestoreManager", "Error clearing shopping list for $userId", e)
            false
        }
    }

    // ---------- SHOPPING HISTORY METHODS ----------

    /** Helper function to get the purchase history collection for a user
     *
     * @param userId The ID of the user
     * @return The Firestore collection reference for the user's purchase history
     */
    private fun getPurchaseHistoryCollection(userId: String) =
        firestore.collection("users").document(userId).collection("purchaseHistory")

    /** Save the current shopping list as a purchase history for the user
     *
     * @param userId ID of the user
     * @param shoppingList List of Pairs, where each Pair contains a Product and its quantity
     * @param totalAmount Total amount spent in this purchase
     * @return True if the purchase history was saved successfully, false otherwise
     * @throws Exception if saving to Firestore fails
     */
    suspend fun savePurchaseHistory(
        userId: String,
        shoppingList: List<Pair<Product, Int>>,
        totalAmount: Double
    ): Boolean {
        try {
            val historyItems = shoppingList.map { (product, quantity) ->
                val effectivePrice = if (product.onSale) {
                    product.price * (1 - product.discount)
                } else {
                    product.price
                }
                ShoppingHistoryItem(
                    productId = product.id,
                    productName = product.name,  // snapshot of localized names
                    quantity = quantity,
                    priceAtPurchase = effectivePrice
                )
            }

            val newPurchase = ShoppingHistory(
                items = historyItems,
                totalAmount = totalAmount,
                datePurchased = Timestamp.now()
            )

            // Store in Firestore under: users/{userId}/purchaseHistory
            firestore.collection("users")
                .document(userId)
                .collection("purchaseHistory")
                .add(newPurchase)
                .await()

            return true

        } catch (e: Exception) {
            Log.e("FirestoreManager", "Error saving purchase history for $userId", e)
            return false
        }
    }

    /** Delete all purchase history for a user
     *
     * @param userId The ID of the user
     * @return True if the operation was successful, false otherwise
     * @throws Exception if deletion from Firestore fails
     */
    suspend fun clearPurchaseHistory(userId: String): Boolean {
        try {
            val batch = firestore.batch()
            val querySnapshot = getPurchaseHistoryCollection(userId).get().await()
            for (document in querySnapshot.documents) {
                batch.delete(document.reference)
            }
            batch.commit().await()
            return true
        } catch (e: Exception) {
            Log.e("FirestoreManager", "Error clearing purchase history for $userId", e)
            return false
        }
    }

    /** Fetch purchase history for a user, ordered by most recent first
     *
     * @param userId ID of the user
     * @return List of ShoppingHistory objects representing the user's purchase history
     * @throws Exception if fetching from Firestore fails
     * @see ShoppingHistory
     */
    suspend fun getPurchaseHistory(userId: String): List<ShoppingHistory> {
        return try {
            val snapshot = getPurchaseHistoryCollection(userId)
                .orderBy("datePurchased", com.google.firebase.firestore.Query.Direction.DESCENDING)
                .get()
                .await()

            snapshot.documents.mapNotNull { doc ->
                doc.toObject(ShoppingHistory::class.java)
            }
        } catch (e: Exception) {
            Log.e("FirestoreManager", "Error getting purchase history for $userId", e)
            emptyList()
        }
    }

    /**
     * Fetch a single shopping history document by its ID
     *
     * @param userId ID of the user
     * @param historyId ID of the shopping history document
     * @return ShoppingHistory object if found, null otherwise
     * @throws Exception if fetching from Firestore fails
     * @see ShoppingHistory
     */
    suspend fun getShoppingHistoryById(userId: String, historyId: String): ShoppingHistory? {
        return try {
            val docRef = getPurchaseHistoryCollection(userId).document(historyId)
            val snapshot = docRef.get().await()
            snapshot.toObject(ShoppingHistory::class.java)
        } catch (e: Exception) {
            Log.e("FirestoreManager", "Error fetching shopping history $historyId for $userId", e)
            null
        }
    }

    /**
     * Fetch a map of product IDs to their image URLs.
     *
     * Handling Firestore's 'whereIn' limitation by doing queries in chunks of 10.
     *
     * @param productIds List of product IDs to fetch images for
     * @return Map where keys are product IDs and values are image URLs
     */
    suspend fun getProductImagesMap(productIds: List<String>): Map<String, String> {
        val images = mutableMapOf<String, String>()
        if (productIds.isEmpty()) return images

        try {
            // Split into chunks of 10
            val chunks = productIds.distinct().chunked(10)

            for (chunk in chunks) {
                val snapshot = firestore.collection("products")
                    .whereIn(FieldPath.documentId(), chunk)
                    .get()
                    .await()

                for (doc in snapshot.documents) {
                    val imageUrl = doc.getString("imageUrl") // adjust if field name differs
                    if (!imageUrl.isNullOrEmpty()) {
                        images[doc.id] = imageUrl
                    }
                }
            }
        } catch (e: Exception) {
            Log.e("FirestoreManager", "Error fetching product images", e)
        }

        return images
    }

    /** Decrease product quantity after purchase
     *
     * @param productId The ID of the product
     * @param quantity The quantity to reduce (default = 1)
     * @return True if update successful, false otherwise
     */
    suspend fun decreaseProductQuantity(productId: String, quantity: Int = 1): Boolean {
        return try {
            firestore.runTransaction { transaction ->
                val docRef = productsCollection.document(productId)
                val snapshot = transaction.get(docRef)

                val currentQuantity = snapshot.getLong("quantityAvailable") ?: 0L
                if (currentQuantity < quantity) {
                    throw Exception("Not enough stock for product $productId")
                }

                transaction.update(docRef, "quantityAvailable", currentQuantity - quantity)
            }.await()

            true
        } catch (e: Exception) {
            Log.e("FirestoreManager", "Error decreasing quantity for $productId", e)
            false
        }
    }

}
