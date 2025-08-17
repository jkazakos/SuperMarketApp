package com.jason.supermarketapp.ui.activities

import android.content.Intent
import android.os.Bundle
import android.widget.TextView
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.jason.supermarketapp.ui.viewmodels.ProductsViewModel
import com.jason.supermarketapp.R
import com.jason.supermarketapp.data.entities.Product
import com.jason.supermarketapp.adapters.ProductAdapter


class ProductsActivity : AppCompatActivity() {

    private lateinit var rvProducts: RecyclerView
    private lateinit var adapter: ProductAdapter
    private lateinit var tvEmpty: TextView
    private val viewModel: ProductsViewModel by viewModels()


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_products)

        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        setupRecyclerView()

        // Observe the product list from the ViewModel
        viewModel.products.observe(this) { products ->
            adapter.updateData(products)
            updateUI(products)
        }

    }

    private fun setupRecyclerView() {
        rvProducts = findViewById(R.id.rvProducts)
        tvEmpty = findViewById(R.id.tvEmpty)
        rvProducts.layoutManager = LinearLayoutManager(this)

        adapter = ProductAdapter(
            products = mutableListOf(),
            onItemClick = { product ->
                val intent = Intent(this, ProductDetailsActivity::class.java)
                intent.putExtra("product", product)
                startActivity(intent)
            },
        )
        rvProducts.adapter = adapter
    }

    private fun updateUI(products: List<Product>) {
        if (products.isEmpty()) {
            tvEmpty.visibility = TextView.VISIBLE
            rvProducts.visibility = RecyclerView.GONE
        } else {
            tvEmpty.visibility = TextView.GONE
            rvProducts.visibility = RecyclerView.VISIBLE
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressedDispatcher.onBackPressed()
        return true
    }
}
