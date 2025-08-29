package com.jason.supermarketapp.ui.activities

import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.widget.TextView
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.firebase.auth.FirebaseAuth
import com.jason.supermarketapp.R
import com.jason.supermarketapp.adapters.WishlistAdapter
import com.jason.supermarketapp.ui.viewmodels.WishlistViewModel
import com.jason.supermarketapp.data.entities.Product
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.launch

class WishlistActivity : AppCompatActivity() {

    private lateinit var rvWishlist: RecyclerView
    private lateinit var adapter: WishlistAdapter
    private lateinit var emptyText: View
    private lateinit var signInMessage: TextView
    private lateinit var progressBar: View


    private val viewModel: WishlistViewModel by viewModels()
    private var clearWishlistMenuItem: MenuItem? = null
    private val _uiMessage = MutableSharedFlow<Int>()
    val uiMessage = _uiMessage.asSharedFlow()
    private val currentUser = FirebaseAuth.getInstance().currentUser
    private val userId: String? get() = currentUser?.uid

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
        signInMessage = findViewById(R.id.sign_in_message)
        progressBar = findViewById(R.id.progressBar)


        if (userId == null) {
            // No user signed in → show message, hide RecyclerView
            rvWishlist.visibility = View.GONE
            emptyText.visibility = View.GONE
            signInMessage.visibility = View.VISIBLE
            return
        }

        // Update UI messages from ViewModel
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiMessage.collect { messageRes ->
                    Toast.makeText(this@WishlistActivity, getString(messageRes), Toast.LENGTH_SHORT).show()
                }
            }
        }

        setupRecyclerView()
        observeViewModel()
    }

    /** Sets up the RecyclerView with its adapter and layout manager. */
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

    /** Observes the ViewModel for changes in the wishlist items. */
    private fun observeViewModel() {
        viewModel.wishlistItems.observe(this) { products ->
            adapter.updateData(products)
            updateUI(products)
            invalidateOptionsMenu()
        }

        viewModel.isLoading.observe(this) { loading ->
            if (loading) {
                progressBar.visibility = View.VISIBLE
                rvWishlist.visibility = View.GONE
                emptyText.visibility = View.GONE
            } else {
                progressBar.visibility = View.GONE
                updateUI(viewModel.wishlistItems.value ?: emptyList())
            }
        }
    }

    /** Updates the UI based on whether the wishlist is empty or not. */
    private fun updateUI(products: List<Product>) {
        if (viewModel.isLoading.value == true) return

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

    /** Shows a confirmation dialog before clearing the wishlist. */
    private fun showClearWishlistConfirmationDialog() {
        AlertDialog.Builder(this)
            .setTitle(getString(R.string.clear_wishlist))
            .setMessage(getString(R.string.clear_wishlist_confirmation_message))
            .setPositiveButton(getString(R.string.yes)) { _, _ ->
                // User confirmed → let ViewModel handle clearing & showing message
                viewModel.clearWishlist()
            }
            .setNegativeButton(getString(R.string.no)) { dialog, _ ->
                dialog.dismiss()
            }
            .show()
    }


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
