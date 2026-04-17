package com.jason.supermarketapp.data.repositories

import com.jason.supermarketapp.data.entities.Product
import com.jason.supermarketapp.data.firestore.FirestoreManager
import kotlinx.coroutines.flow.Flow
import java.util.Locale

class ProductRepository {

    // Firestore manager instance to handle Firestore operations
    private val firestoreManager = FirestoreManager()

    /** Fetches the list of products from Firestore as a Flow.
     *
     * @return A Flow emitting a list of Product objects.
     */
    fun getProducts(): Flow<List<Product>> {
        return firestoreManager.getProducts()
    }

    /** Fetches the set of product categories from Firestore as a Flow.
     *
     * @param locale The locale to filter categories by language. Defaults to the device's default language.
     * @return A Flow emitting a set of category strings.
     */
    fun getCategories(locale: String = Locale.getDefault().language): Flow<Set<String>> {
        return firestoreManager.getCategories(locale)
    }

    /** Adds a new product to Firestore.
     *
     * @param product The Product object to be added.
     */
    suspend fun addProduct(product: Product) {
        firestoreManager.addProduct(product)
    }

    /** Checks if a product with the given ID exists in Firestore.
     *
     * @param productId The ID of the product to check.
     * @return True if the product exists, false otherwise.
     */
    suspend fun productExists(productId: String): Boolean {
        return firestoreManager.productExists(productId)
    }
}
