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
import java.util.Locale

sealed class ProductsUiState {
    object Loading : ProductsUiState()
    data class Success(
        val products: List<Product>,
        val categories: Set<String>,
        val selectedCategories: Set<String>
        ) : ProductsUiState()
    data class Error(val message: String) : ProductsUiState()
}

class ProductsViewModel(): ViewModel() {
    private val repository = ProductRepository()
    private val _selectedCategories = MutableStateFlow<Set<String>>(emptySet())
    private val locale = Locale.getDefault().language
    private val allProducts = repository.getProducts()
    val uiState: StateFlow<ProductsUiState> = combine(
        allProducts,
        repository.getCategories(locale),
        _selectedCategories
    ) { allProductsList, categories, selected ->
        val filteredProducts = if (selected.isEmpty()) {
            allProductsList
        } else {
            allProductsList.filter { product ->
                val productCategory = product.category[locale] ?: product.category["en"] ?: ""
                selected.contains(productCategory)
            }
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

    /** Update the selected categories for filtering products.
     * If no categories are selected, all products will be shown.
     *
     * @param selectedCategories A set of selected category names.
     */
    fun setCategoryFilter(selectedCategories: Set<String>) {
        _selectedCategories.value = selectedCategories
    }

}