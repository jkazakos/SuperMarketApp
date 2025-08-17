package com.jason.supermarketapp.data.repositories

import android.util.Log
import com.google.firebase.firestore.FirebaseFirestore
import com.jason.supermarketapp.data.entities.Product
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.tasks.await

class ProductRepository {

    private val firestore = FirebaseFirestore.getInstance()
    private val productsCollection = firestore.collection("products")

    // This function will now return a Flow of product lists
    fun getProducts(): Flow<List<Product>> = callbackFlow {
        val listenerRegistration = productsCollection.addSnapshotListener { querySnapshot, e ->
            if (e != null) {
                Log.e("ProductRepository", "Listen failed.", e)
                close(e) // close the flow with an error
                return@addSnapshotListener
            }

            if (querySnapshot != null) {
                val products = querySnapshot.documents.mapNotNull { document ->
                    document.toObject(Product::class.java)?.apply {
                        id = document.id
                    }
                }
                trySend(products)
            }
        }

        // The callbackFlow block should suspend until the listener is removed
        awaitClose { listenerRegistration.remove() }
    }

    // New function to add a product to Firestore
    fun addProduct(product: Product) {
        productsCollection.document(product.id)
            .set(product)
            .addOnSuccessListener {
                Log.d("ProductRepo", "Product added with ID: ${product.id}")
            }
            .addOnFailureListener { e ->
                // Log the error
                Log.w("ProductRepo", "Error adding document", e)
            }
    }

    suspend fun productExists(productId: String): Boolean {
        val doc = firestore.collection("products").document(productId).get().await()
        return doc.exists()
    }
}