package com.jason.supermarketapp.data.repositories

import com.jason.supermarketapp.data.entities.Product
import com.jason.supermarketapp.data.firestore.FirestoreManager
import kotlinx.coroutines.flow.Flow

class ProductRepository {

    private val firestoreManager = FirestoreManager()

    fun getProducts(): Flow<List<Product>> {
        return firestoreManager.getProducts()
    }
    fun getCategories(): Flow<Set<Int>> {
        return firestoreManager.getCategories()
    }
    suspend fun addProduct(product: Product) {
        firestoreManager.addProduct(product)
    }
    suspend fun productExists(productId: String): Boolean {
        return firestoreManager.productExists(productId)
    }
}