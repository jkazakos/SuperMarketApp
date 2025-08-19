package com.jason.supermarketapp.ui.activities

import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
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
    private var clearWishlistMenuItem: MenuItem? = null

    // Override to inflate the menu
    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        menuInflater.inflate(R.menu.wishlist_menu, menu)
        return true
    }

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
            invalidateOptionsMenu()
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

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_clear_wishlist -> {
                showClearWishlistConfirmationDialog()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    private fun showClearWishlistConfirmationDialog() {
        AlertDialog.Builder(this)
            .setTitle(getString(R.string.clear_wishlist))
            .setMessage(getString(R.string.clear_wishlist_confirmation_message))
            .setPositiveButton(getString(R.string.yes)) { _, _ ->
                // User confirmed, now clear the wishlist
                viewModel.clearWishlist()
                Toast.makeText(this, getString(R.string.wishlist_cleared), Toast.LENGTH_SHORT).show()
            }
            .setNegativeButton(getString(R.string.no)) { dialog, _ ->
                // User canceled, dismiss the dialog
                dialog.dismiss()
            }
            .show()
    }

    // In the onPrepareOptionsMenu method, you can simply check if the list is empty.
    override fun onPrepareOptionsMenu(menu: Menu?): Boolean {
        clearWishlistMenuItem = menu?.findItem(R.id.action_clear_wishlist)
        val products = viewModel.wishlistItems.value ?: emptyList()
        clearWishlistMenuItem?.isEnabled = products.isNotEmpty()
        return super.onPrepareOptionsMenu(menu)
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressedDispatcher.onBackPressed()
        return true
    }

}
