package com.jason.supermarketapp.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.asLiveData
import androidx.lifecycle.viewModelScope
import com.jason.supermarketapp.data.seeds.TestDataSeeder
import com.jason.supermarketapp.data.repositories.ProductRepository


class ProductsViewModel(): ViewModel() {
    private val repository = ProductRepository()

    init {
        // Seed the database with test products if needed
        TestDataSeeder.insertTestProducts(repository, viewModelScope)
    }

    // Expose the list of products as LiveData
    val products = repository.getProducts().asLiveData()
}