package com.jason.supermarketapp.ui.activities

import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.firebase.auth.FirebaseAuth
import com.jason.supermarketapp.R
import com.jason.supermarketapp.adapters.ShoppingListAdapter
import com.jason.supermarketapp.ui.viewmodels.ShoppingListViewModel
import com.jason.supermarketapp.data.entities.Product
import kotlinx.coroutines.launch

class ShoppingListActivity : AppCompatActivity() {

    private lateinit var rvShoppingList: RecyclerView
    private lateinit var adapter: ShoppingListAdapter
    private lateinit var emptyText: View
    private lateinit var signInMessage: TextView
    private lateinit var progressBar: View


    private val viewModel: ShoppingListViewModel by viewModels()
    private var clearShoppingListMenuItem: MenuItem? = null
    private val currentUser = FirebaseAuth.getInstance().currentUser
    private val userId: String? get() = currentUser?.uid
    private lateinit var checkoutButton: Button

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        menuInflater.inflate(R.menu.shopping_list_menu, menu)
        return true
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_shopping_list)

        checkoutButton = findViewById(R.id.btnCheckout)

        checkoutButton.visibility = View.GONE

        checkoutButton.setOnClickListener {
            // Check if there are items in the shopping list
            val items = viewModel.shoppingListItems.value
            if (items.isNullOrEmpty()) {
                Toast.makeText(this, getString(R.string.empty_shopping_list_text), Toast.LENGTH_SHORT).show()
            }

            // Find all out-of-stock items
            val outOfStockItems = items!!.filter { it.first.quantityAvailable <= 0 }
            val exceededStockItems = items.filter { it.second > it.first.quantityAvailable && it.first.quantityAvailable > 0 }
            if (outOfStockItems.isNotEmpty() || exceededStockItems.isNotEmpty()) {
                val message = buildString {
                    if (outOfStockItems.isNotEmpty()) {
                        append("${getString(R.string.out_of_stock)}:\n")
                        outOfStockItems.forEach { append("• ${it.first.getLocalizedName()}\n") }
                    }
                    if (exceededStockItems.isNotEmpty()) {
                        append("\n${getString(R.string.exceeded_stock)}:\n")
                        exceededStockItems.forEach { append("• ${it.first.getLocalizedName()}(${it.second} -> ${getString(R.string.product_availability, it.first.quantityAvailable)})\n") }
                    }
                }
                AlertDialog.Builder(this)
                    .setTitle(getString(R.string.stock_issues_title))
                    .setMessage(message)
                    .setPositiveButton(getString(android.R.string.ok), null)
                    .show()
                return@setOnClickListener
            }

            // Navigate to your CheckoutActivity
            val intent = Intent(this, CheckoutActivity::class.java)
            startActivity(intent)

        }

        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = getString(R.string.shopping_list)

        rvShoppingList = findViewById(R.id.rvShoppingList)
        emptyText = findViewById(R.id.empty_shopping_list)
        signInMessage = findViewById(R.id.sign_in_message)
        progressBar = findViewById(R.id.progressBar)


        if (userId == null) {
            // No user signed in → show message, hide RecyclerView
            rvShoppingList.visibility = View.GONE
            emptyText.visibility = View.GONE
            signInMessage.visibility = View.VISIBLE
            signInMessage.text = getString(R.string.sign_in_required)
            return
        }

        setupRecyclerView()
        observeViewModel()
    }

    /** Sets up the RecyclerView with its adapter and layout manager.
     * Also defines the click listeners for item interactions.
     */
    private fun setupRecyclerView() {
        rvShoppingList.layoutManager = LinearLayoutManager(this)

        adapter = ShoppingListAdapter(
            items = mutableListOf<Pair<Product, Int>>(),
            onItemClick = { product ->
                val intent = Intent(this, ProductDetailsActivity::class.java)
                intent.putExtra("product", product)
                startActivity(intent)
            },
            onIncreaseClick = { product, currentQuantity ->
                lifecycleScope.launch {
                    val success = viewModel.incrementQuantity(product.id, 1)
                    if (!success) {
                        Toast.makeText(this@ShoppingListActivity, getString(R.string.failed_to_update_item), Toast.LENGTH_SHORT).show()
                    }
                }
            },
            onDecreaseClick = { product, newQuantity ->
                lifecycleScope.launch {
                    val success = viewModel.decrementQuantity(product.id, newQuantity)
                    if (!success) {
                        Toast.makeText(
                            this@ShoppingListActivity,
                            "Failed to update item",
                            Toast.LENGTH_SHORT
                        ).show()
                        // Optionally: revert UI
                    }
                }
            }
        )
        rvShoppingList.adapter = adapter
    }

    /** Observes changes in the ViewModel's LiveData and updates the UI accordingly.
     * Updates the RecyclerView's data and manages the visibility of UI elements based on the data state.
     */
    private fun observeViewModel() {
        viewModel.shoppingListItems.observe(this) { items ->
            adapter.updateData(items)
            updateUI(items.map { it.first })
            invalidateOptionsMenu()
        }

        viewModel.isLoading.observe(this) { loading ->
            if (loading) {
                progressBar.visibility = View.VISIBLE
                rvShoppingList.visibility = View.GONE
                emptyText.visibility = View.GONE
                checkoutButton.visibility = View.GONE
            } else {
                progressBar.visibility = View.GONE
                updateUI(viewModel.shoppingListItems.value?.map { it.first } ?: emptyList())
            }
        }
    }

    /** Updates the UI based on whether the shopping list is empty or not.
     * Shows or hides the RecyclerView, empty text, and checkout button accordingly.
     */
    private fun updateUI(products: List<Product>) {
        if (viewModel.isLoading.value == true) return

        if (products.isEmpty()) {
            rvShoppingList.visibility = View.GONE
            emptyText.visibility = View.VISIBLE
            checkoutButton.visibility = View.GONE
        } else {
            rvShoppingList.visibility = View.VISIBLE
            emptyText.visibility = View.GONE
            checkoutButton.visibility = View.VISIBLE
        }
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_clear_shopping_list -> {
                showClearShoppingListConfirmationDialog()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    /** Displays a confirmation dialog before clearing the shopping list.
     * If the user confirms, it calls the ViewModel to clear the list and shows a toast message.
     */
    private fun showClearShoppingListConfirmationDialog() {
        AlertDialog.Builder(this)
            .setTitle(getString(R.string.clear_shopping_list))
            .setMessage(getString(R.string.clear_shopping_list_confirmation_message))
            .setPositiveButton(getString(R.string.yes)) { _, _ ->
                // User confirmed, now clear the wishlist
                lifecycleScope.launch {
                    val success = viewModel.clearShoppingList() // suspend call
                    if (success) {
                        Toast.makeText(
                            this@ShoppingListActivity,
                            getString(R.string.shopping_list_cleared),
                            Toast.LENGTH_SHORT
                        ).show()
                        adapter.updateData(emptyList()) // clear UI
                    } else {
                        Toast.makeText(
                            this@ShoppingListActivity,
                            getString(R.string.failed_to_clear_shopping_list),
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            }
            .setNegativeButton(getString(R.string.no)) { dialog, _ ->
                dialog.dismiss()
            }
            .show()
    }

    override fun onPrepareOptionsMenu(menu: Menu?): Boolean {
        clearShoppingListMenuItem = menu?.findItem(R.id.action_clear_shopping_list)
        val products = viewModel.shoppingListItems.value ?: emptyList()
        clearShoppingListMenuItem?.isEnabled = products.isNotEmpty()
        return super.onPrepareOptionsMenu(menu)
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressedDispatcher.onBackPressed()
        return true
    }

}
