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
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.jason.supermarketapp.R
import com.jason.supermarketapp.data.entities.ShoppingHistory
import com.jason.supermarketapp.adapters.ShoppingHistoryAdapter
import com.jason.supermarketapp.ui.viewmodels.ShoppingHistoryViewModel
import com.google.firebase.auth.FirebaseAuth

class ShoppingHistoryActivity : AppCompatActivity() {

    private val viewModel: ShoppingHistoryViewModel by viewModels()
    private lateinit var rvShoppingHistory: RecyclerView
    private lateinit var adapter: ShoppingHistoryAdapter
    private lateinit var emptyText: TextView
    private lateinit var signInMessage: TextView
    private lateinit var progressBar: View
    private var clearShoppingHistoryMenuItem: MenuItem? = null
    private val currentUser = FirebaseAuth.getInstance().currentUser
    private val userId: String? get() = currentUser?.uid

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        menuInflater.inflate(R.menu.shopping_history_menu, menu)
        return true
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_shopping_history)

        supportActionBar?.title = getString(R.string.shopping_history)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        rvShoppingHistory = findViewById(R.id.rvShoppingHistory)
        emptyText = findViewById(R.id.shoppingHistoryEmpty)
        signInMessage = findViewById(R.id.sign_in_message)
        progressBar = findViewById(R.id.progressBar)

        adapter = ShoppingHistoryAdapter(emptyList()) { historyItem ->
            val intent = Intent(this, ShoppingHistoryDetailsActivity::class.java)
            intent.putExtra("historyId", historyItem.id)
            startActivity(intent)
        }

        rvShoppingHistory.layoutManager = LinearLayoutManager(this)
        rvShoppingHistory.adapter = adapter

        if (userId == null) {
            emptyText.visibility = View.GONE
            rvShoppingHistory.visibility = View.GONE
            signInMessage.visibility = View.VISIBLE

        }

        observeViewModel()
        viewModel.loadPurchaseHistory()
    }

    private fun observeViewModel() {
        viewModel.isLoading.observe(this) { loading ->
            val historyList = viewModel.purchaseHistory.value ?: emptyList()
            updateUI(historyList, loading)
            invalidateOptionsMenu()
        }

        viewModel.purchaseHistory.observe(this) { historyList ->
            val loading = viewModel.isLoading.value ?: false
            updateUI(historyList, loading)
            invalidateOptionsMenu()
        }
    }

    /** Update the UI based on the shopping history list */
    private fun updateUI(historyList: List<ShoppingHistory>, isLoading: Boolean) {
        if (isLoading) {
            progressBar.visibility = View.VISIBLE
            rvShoppingHistory.visibility = View.GONE
            emptyText.visibility = View.GONE
        } else {
            progressBar.visibility = View.GONE
            if (historyList.isEmpty()) {
                emptyText.visibility = View.VISIBLE
                rvShoppingHistory.visibility = View.GONE
            } else {
                emptyText.visibility = View.GONE
                rvShoppingHistory.visibility = View.VISIBLE
                adapter.updateData(historyList)
            }
        }
    }


    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_clear_shopping_history -> {
                showClearShoppingHistoryConfirmationDialog()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    /** Show a confirmation dialog before clearing the shopping history */
    private fun showClearShoppingHistoryConfirmationDialog() {
        AlertDialog.Builder(this)
            .setTitle(getString(R.string.clear_shopping_history))
            .setMessage(getString(R.string.clear_shopping_history_confirmation_message))
            .setPositiveButton(getString(R.string.yes)) { _, _ ->
                // User confirmed, now clear the wishlist
                viewModel.clearPurchaseHistory()
                Toast.makeText(this, getString(R.string.shopping_history_cleared), Toast.LENGTH_SHORT).show()
            }
            .setNegativeButton(getString(R.string.no)) { dialog, _ ->
                // User canceled, dismiss the dialog
                dialog.dismiss()
            }
            .show()
    }

    override fun onPrepareOptionsMenu(menu: Menu?): Boolean {
        clearShoppingHistoryMenuItem = menu?.findItem(R.id.action_clear_shopping_history)
        val products = viewModel.purchaseHistory.value ?: emptyList()
        clearShoppingHistoryMenuItem?.isEnabled = products.isNotEmpty()
        return super.onPrepareOptionsMenu(menu)
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressedDispatcher.onBackPressed()
        return true
    }
}
