package com.jason.supermarketapp.data.firestore

import android.util.Log
import com.google.firebase.Timestamp
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.snapshots
import com.jason.supermarketapp.data.entities.Product
import com.jason.supermarketapp.data.entities.ShoppingHistory
import com.jason.supermarketapp.data.entities.ShoppingHistoryItem
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.tasks.await
import java.util.Locale

class FirestoreManager {

    private val firestore = FirebaseFirestore.getInstance()

    // ---------- PRODUCT METHODS ----------
    private val productsCollection = firestore.collection("products")

    /** Get all products from Firestore as a Flow
     * This allows real-time updates to the product list.
     */
    fun getProducts(): Flow<List<Product>> {
        return productsCollection.snapshots().map { snapshot ->
            snapshot.documents.mapNotNull { it.toObject(Product::class.java) }
        }
    }

    /** Add a new product to Firestore
     *
     * @param product The product to add
     */
    suspend fun addProduct(product: Product) {
        productsCollection.document(product.id)
            .set(product)
            .addOnSuccessListener {
                Log.d("FirestoreManager", "Product added with ID: ${product.id}")
            }
            .addOnFailureListener { e ->
                Log.w("FirestoreManager", "Error adding document", e)
            }.await() // Use await() to make this a suspending function
    }

    /** Check if a product exists by its ID
     *
     * @param productId The ID of the product to check
     * @return True if the product exists, false otherwise
     */
    suspend fun productExists(productId: String): Boolean {
        return productsCollection.document(productId).get().await().exists()
    }

    /**Get a list of unique product categories, localized to the specified language.
     *
     * @param locale The locale code (e.g., "en", "es") for localization. Defaults to device's locale.
     * @return A Flow emitting a set of unique category names in the specified locale.
     */
    fun getCategories(locale: String = Locale.getDefault().language): Flow<Set<String>> {
        return productsCollection.snapshots().map { snapshot ->
            snapshot.documents.mapNotNull { doc ->
                val categoryMap = doc.get("category") as? Map<*, *>
                categoryMap?.get(locale) as? String ?: (categoryMap?.get("en") as? String)
            }.toSet()
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
     */
    fun getRawWishlistItems(userId: String): Flow<List<Map<String, Any>>> {
        return getWishlistCollection(userId).snapshots().map { snapshot -> snapshot.documents.map { it.data ?: emptyMap() }
        }
    }

    /** Add a product to the wishlist
     *
     * @param userId The ID of the user
     * @param productId The ID of the product to add to the wishlist
     */
    suspend fun addWishlistItem(userId: String, productId: String) {
        val newItem = hashMapOf("productId" to productId)
        // Use productId as the document ID
        getWishlistCollection(userId).document(productId).set(newItem).await()
    }

    /** Remove a product from the wishlist
     *
     * @param userId The ID of the user
     * @param productId The ID of the product to remove from the wishlist
     */
    suspend fun removeWishlistItem(userId: String, productId: String) {
        getWishlistCollection(userId).document(productId).delete().await()
    }

    /** Check if a product is in the wishlist
     *
     * @param userId The ID of the user
     * @param productId The ID of the product to check
     * @return True if the product is in the wishlist, false otherwise
     */
    suspend fun isProductInWishlist(userId: String, productId: String): Boolean {
        return try {
            val documentSnapshot = getWishlistCollection(userId).document(productId).get().await()
            documentSnapshot.exists()
        } catch (e: Exception) {
            Log.e("FirestoreManager", "Error checking wishlist status for $productId", e)
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
                    close(e)
                    return@addSnapshotListener
                }
                // Check if the query result is not empty
                trySend(documentSnapshot?.exists() ?: false)
            }

        awaitClose { listenerRegistration.remove() }
    }

    /** Clear the entire wishlist for a user
     *
     * @param userId The ID of the user
     */
    suspend fun clearWishlist(userId: String) {
        val batch = firestore.batch()
        val querySnapshot = getWishlistCollection(userId).get().await()
        for (document in querySnapshot.documents) {
            batch.delete(document.reference)
        }
        batch.commit().await()
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
     */
    fun getRawShoppingListItems(userId: String): Flow<List<Map<String, Any>>> {
        return getShoppingListCollection(userId).snapshots().map { snapshot ->
            snapshot.documents.map { it.data ?: emptyMap() }
        }
    }

    /** Add or update a product in the shopping list
     * If the product already exists, increment its quantity.
     * If it doesn't exist, create a new entry with the specified quantity.
     *
     * @param userId The ID of the user
     * @param productId The ID of the product to add or update
     * @param quantity The quantity to add (default is 1)
     */
    suspend fun addOrUpdateShoppingListItem(userId: String, productId: String, quantity: Int = 1) {
        val docRef = getShoppingListCollection(userId).document(productId)
        val snapshot = docRef.get().await()

        if (snapshot.exists()) {
            // Increment quantity if item already exists
            val currentQuantity = snapshot.getLong("productQuantity")?.toInt() ?: 1
            docRef.update("productQuantity", currentQuantity + quantity).await()
        } else {
            // Create new entry if item doesn't exist
            val newItem = hashMapOf(
                "productId" to productId,
                "productQuantity" to quantity
            )
            docRef.set(newItem).await()
        }
    }

    /** Update the quantity of a specific product in the shopping list
     *
     * @param userId The ID of the user
     * @param productId The ID of the product to update
     * @param newQuantity The new quantity to set
     */
    suspend fun updateShoppingListItemQuantity(userId: String, productId: String, newQuantity: Int) {
        getShoppingListCollection(userId).document(productId)
            .update("productQuantity", newQuantity).await()
    }

    /** Remove a product from the shopping list
     *
     * @param userId The ID of the user
     * @param productId The ID of the product to remove
     */
    suspend fun removeShoppingListItem(userId: String, productId: String) {
        getShoppingListCollection(userId).document(productId).delete().await()
    }

    /** Clear the entire shopping list for a user
     *
     * @param userId The ID of the user
     */
    suspend fun clearShoppingList(userId: String) {
        val batch = firestore.batch()
        val querySnapshot = getShoppingListCollection(userId).get().await()
        for (document in querySnapshot.documents) {
            batch.delete(document.reference)
        }
        batch.commit().await()
    }

    // ---------- PURCHASE HISTORY METHODS ----------

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
                ShoppingHistoryItem(
                    productId = product.id,
                    productName = product.name,  // snapshot of localized names
                    quantity = quantity,
                    priceAtPurchase = product.price
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

    //TODO: Implement exception handling and messaging for all methods

}