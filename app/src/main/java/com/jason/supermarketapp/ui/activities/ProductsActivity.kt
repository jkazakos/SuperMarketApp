package com.jason.supermarketapp.ui.activities

import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.widget.TextView
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.jason.supermarketapp.ui.viewmodels.ProductsViewModel
import com.jason.supermarketapp.R
import com.jason.supermarketapp.data.entities.Product
import com.jason.supermarketapp.adapters.ProductAdapter
import com.jason.supermarketapp.ui.viewmodels.ProductsUiState
import com.jason.supermarketapp.ui.viewmodels.SortType
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch


class ProductsActivity : AppCompatActivity() {

    private lateinit var rvProducts: RecyclerView
    private lateinit var adapter: ProductAdapter
    private lateinit var tvEmpty: TextView
    private val viewModel: ProductsViewModel by viewModels()
    private var filterDialog: AlertDialog? = null
    private var filterMenuItem: MenuItem? = null
    private var searchMenuItem: MenuItem? = null
    private lateinit var progressBar: View // Add a progress bar to show loading state

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        menuInflater.inflate(R.menu.products_menu, menu)
        filterMenuItem = menu?.findItem(R.id.action_filter)
        searchMenuItem = menu?.findItem(R.id.action_search)
        val searchView = searchMenuItem?.actionView as? androidx.appcompat.widget.SearchView

        searchView?.queryHint = getString(R.string.search)

        searchView?.setOnQueryTextListener(object : androidx.appcompat.widget.SearchView.OnQueryTextListener {
            override fun onQueryTextSubmit(query: String?): Boolean {
                viewModel.setSearchQuery(query.orEmpty())
                return true
            }

            override fun onQueryTextChange(newText: String?): Boolean {
                viewModel.setSearchQuery(newText.orEmpty())
                return true
            }
        })
        return true
    }


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_products)

        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        progressBar = findViewById(R.id.progressBar) // Initialize the progress bar

        setupRecyclerView()
        setupObservers()
    }

    /** Initialize RecyclerView and its adapter */
    private fun setupRecyclerView() {
        rvProducts = findViewById(R.id.rvProducts)
        tvEmpty = findViewById(R.id.tvEmpty)
        rvProducts.layoutManager = LinearLayoutManager(this)

        adapter = ProductAdapter(
            onItemClick = { product ->
                val intent = Intent(this, ProductDetailsActivity::class.java)
                intent.putExtra("product", product)
                startActivity(intent)
            },
        )
        rvProducts.adapter = adapter
    }

    /** Setup observers for ViewModel's UI state */
    private fun setupObservers() {
        lifecycleScope.launch {
            viewModel.uiState.collectLatest { state ->
                when (state) {
                    is ProductsUiState.Loading -> {
                        progressBar.visibility = View.VISIBLE
                        filterMenuItem?.isEnabled = false
                        rvProducts.visibility = View.GONE
                        tvEmpty.visibility = View.GONE
                    }
                    is ProductsUiState.Success -> {
                        progressBar.visibility = View.GONE
                        filterMenuItem?.isEnabled = true
                        adapter.submitList(state.products)
                        updateUI(state.products)
                    }
                    is ProductsUiState.Error -> {
                        progressBar.visibility = View.GONE
                        filterMenuItem?.isEnabled = true
                        tvEmpty.visibility = View.VISIBLE
                        tvEmpty.text = state.message
                    }
                }
            }
        }
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_filter -> {
                val state = viewModel.uiState.value
                if (state is ProductsUiState.Success) {
                    showFilterDialog(state.categories, state.selectedCategories)
                }
                true
            }
            R.id.action_sort -> {
                showSortDialog()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    /** Show filter dialog with categories */
    private fun showFilterDialog(allCategories: Set<String>, selectedCategories: Set<String>) {
        val allCategoriesArray = allCategories.toTypedArray()
        val selectedCategoriesSet = selectedCategories.toMutableSet()

        val checkedItems = allCategoriesArray.map {
            it in selectedCategoriesSet
        }.toBooleanArray()

        AlertDialog.Builder(this)
            .setTitle(R.string.filter_categories)
            .setMultiChoiceItems(allCategoriesArray, checkedItems) { _, which, isChecked ->
                val category = allCategoriesArray[which]
                if (isChecked) selectedCategoriesSet.add(category) else selectedCategoriesSet.remove(category)
            }
            .setPositiveButton(R.string.apply_text) { _, _ ->
                viewModel.setCategoryFilter(selectedCategoriesSet)
            }
            .setNegativeButton(R.string.cancel_text, null)
            .show()
    }

    /** Show sort options dialog */
    private fun showSortDialog() {
        val options = arrayOf(
            getString(R.string.sort_name_asc),
            getString(R.string.sort_name_desc),
            getString(R.string.sort_price_asc),
            getString(R.string.sort_price_desc),
            getString(R.string.sort_discount_asc),
            getString(R.string.sort_discount_desc)
        )

        val currentSort = when (viewModel.sortType) {
            SortType.NAME_ASCENDING -> 0
            SortType.NAME_DESCENDING -> 1
            SortType.PRICE_ASCENDING -> 2
            SortType.PRICE_DESCENDING -> 3
            SortType.DISCOUNT_ASCENDING -> 4
            SortType.DISCOUNT_DESCENDING -> 5
        }

        AlertDialog.Builder(this)
            .setTitle(getString(R.string.sort))
            .setSingleChoiceItems(options, currentSort) { dialog, which ->
                when (which) {
                    0 -> viewModel.setSortType(SortType.NAME_ASCENDING)
                    1 -> viewModel.setSortType(SortType.NAME_DESCENDING)
                    2 -> viewModel.setSortType(SortType.PRICE_ASCENDING)
                    3 -> viewModel.setSortType(SortType.PRICE_DESCENDING)
                    4 -> viewModel.setSortType(SortType.DISCOUNT_ASCENDING)
                    5 -> viewModel.setSortType(SortType.DISCOUNT_DESCENDING)
                }
                dialog.dismiss() // close after selection
            }
            .show()
    }


    /** Update UI based on product list */
    private fun updateUI(products: List<Product>) {
        if (products.isEmpty()) {
            tvEmpty.visibility = TextView.VISIBLE
            rvProducts.visibility = RecyclerView.GONE

            val state = viewModel.uiState.value
            if (state is ProductsUiState.Success) {
                tvEmpty.text = if (state.searchQuery.isNotBlank()) {
                    getString(R.string.no_results_found, state.searchQuery) // "No results found for ..."
                } else {
                    getString(R.string.no_products_available) // "No products available"
                }
            }
        } else {
            tvEmpty.visibility = TextView.GONE
            rvProducts.visibility = RecyclerView.VISIBLE
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressedDispatcher.onBackPressed()
        return true
    }

    override fun onDestroy() {
        filterDialog?.dismiss()
        super.onDestroy()
    }
}
