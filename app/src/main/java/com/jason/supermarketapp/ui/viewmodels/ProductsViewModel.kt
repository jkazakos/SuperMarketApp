package com.jason.supermarketapp.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jason.supermarketapp.data.entities.Product
import com.jason.supermarketapp.data.repositories.ProductRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn

sealed class ProductsUiState {
    object Loading : ProductsUiState()
    data class Success(
        val products: List<Product>,
        val categories: Set<Int>,
        val selectedCategories: Set<Int>
        ) : ProductsUiState()
    data class Error(val message: String) : ProductsUiState()
}

class ProductsViewModel(): ViewModel() {
    private val repository = ProductRepository()
    private val _selectedCategories = MutableStateFlow<Set<Int>>(emptySet())
    private val allProducts = repository.getProducts()
    val uiState: StateFlow<ProductsUiState> = combine(
        allProducts,
        repository.getCategories(),
        _selectedCategories
    ) { allProductsList, categories, selected ->
        val filteredProducts = if (selected.isEmpty()) {
            allProductsList
        } else {
            allProductsList.filter { selected.contains(it.categoryResId) }
        }
        ProductsUiState.Success(
            products = filteredProducts,
            categories = categories,
            selectedCategories = selected
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = ProductsUiState.Loading
    )

    // Function to update the selected categories
    fun setCategoryFilter(selectedCategories: Set<Int>) {
        _selectedCategories.value = selectedCategories
    }

}