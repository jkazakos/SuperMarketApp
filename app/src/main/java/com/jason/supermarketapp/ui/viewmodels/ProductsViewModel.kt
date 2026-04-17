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

/** Enum representing the different sorting options for products. */
enum class SortType {
    NAME_ASCENDING,
    NAME_DESCENDING,
    PRICE_ASCENDING,
    PRICE_DESCENDING,
    DISCOUNT_ASCENDING,
    DISCOUNT_DESCENDING
}

sealed class ProductsUiState {
    object Loading : ProductsUiState()
    data class Success(
        val products: List<Product>,
        val categories: Set<String>,
        val selectedCategories: Set<String>,
        val searchQuery: String
        ) : ProductsUiState()
    data class Error(val message: String) : ProductsUiState()
}

class ProductsViewModel(): ViewModel() {
    private val repository = ProductRepository()
    private val _selectedCategories = MutableStateFlow<Set<String>>(emptySet())
    private val _searchQuery = MutableStateFlow("")
    private val locale = Locale.getDefault().language
    private val allProducts = repository.getProducts()
    private val _sortType = MutableStateFlow(SortType.NAME_ASCENDING) // default sort

    val uiState: StateFlow<ProductsUiState> = combine(
        allProducts,
        repository.getCategories(locale),
        _selectedCategories,
        _searchQuery,
        _sortType
    ) { allProductsList, categories, selected, query, sortType ->

        //1. Filter by category
        val categoryFiltered = if (selected.isEmpty()) {
            allProductsList
        } else {
            allProductsList.filter { product ->
                val productCategory = product.category[locale] ?: product.category["en"] ?: ""
                selected.contains(productCategory)
            }
        }

        // 2. Filter by search query
        val queryFiltered = if (query.isBlank()) {
            categoryFiltered
        } else {
            categoryFiltered.filter { product ->
                val productName = product.name[locale] ?: product.name["en"] ?: ""
                productName.contains(query, ignoreCase = true)
            }
        }

        // 3. Apply sorting
        val sorted = when (sortType) {
            SortType.NAME_ASCENDING -> queryFiltered.sortedBy { it.name[locale] ?: it.name["en"] ?: "" }
            SortType.NAME_DESCENDING -> queryFiltered.sortedByDescending { it.name[locale] ?: it.name["en"] ?: "" }
            SortType.PRICE_ASCENDING -> queryFiltered.sortedBy { it.price * (1 - it.discount) }
            SortType.PRICE_DESCENDING -> queryFiltered.sortedByDescending { it.price * (1 - it.discount) }
            SortType.DISCOUNT_ASCENDING -> queryFiltered.sortedBy { it.discount }
            SortType.DISCOUNT_DESCENDING -> queryFiltered.sortedByDescending { it.discount }
        }

        ProductsUiState.Success(
            products = sorted,
            categories = categories,
            selectedCategories = selected,
            searchQuery = query
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

    /** Update search query
     *
     * @param query The search query string.
     */
    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    /** Update sort type
     *
     * @param sortType The selected SortType.
     */
    fun setSortType(sortType: SortType) {
        _sortType.value = sortType
    }

    val sortType: SortType
        get() = _sortType.value

}
