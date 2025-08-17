package com.jason.supermarketapp.ui.activities

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.jason.supermarketapp.R
import com.jason.supermarketapp.adapters.WishlistAdapter
import com.jason.supermarketapp.ui.viewmodels.WishlistViewModel
import com.jason.supermarketapp.data.entities.Product

class WishlistActivity : AppCompatActivity() {

    private lateinit var rvWishlist: RecyclerView
    private lateinit var adapter: WishlistAdapter
    private lateinit var emptyText: View

    private val viewModel: WishlistViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_wishlist)

        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = getString(R.string.wishlist)

        rvWishlist = findViewById(R.id.rvWishlist)
        emptyText = findViewById(R.id.empty_wishlist)

        setupRecyclerView()
        observeViewModel()
    }

    private fun setupRecyclerView() {
        rvWishlist.layoutManager = LinearLayoutManager(this)

        adapter = WishlistAdapter(
            products = mutableListOf(),
            onItemClick = { product ->
                val intent = Intent(this, ProductDetailsActivity::class.java)
                intent.putExtra("product", product)
                startActivity(intent)
            },
            onRemoveClick = { product ->
                viewModel.removeProductFromWishlist(product.id)
            }
        )
        rvWishlist.adapter = adapter
    }

    private fun observeViewModel() {
        viewModel.wishlistItems.observe(this) { products ->
            adapter.updateData(products)
            updateUI(products)
        }
    }

    private fun updateUI(products: List<Product>) {
        if (products.isEmpty()) {
            rvWishlist.visibility = View.GONE
            emptyText.visibility = View.VISIBLE
        } else {
            rvWishlist.visibility = View.VISIBLE
            emptyText.visibility = View.GONE
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressedDispatcher.onBackPressed()
        return true
    }

}
