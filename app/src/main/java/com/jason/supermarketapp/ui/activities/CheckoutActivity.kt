package com.jason.supermarketapp.ui.activities

import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.firebase.auth.FirebaseAuth
import com.jason.supermarketapp.MainActivity
import com.jason.supermarketapp.R
import com.jason.supermarketapp.adapters.CheckoutAdapter
import com.jason.supermarketapp.data.repositories.ShoppingHistoryRepository
import com.jason.supermarketapp.ui.viewmodels.ShoppingListViewModel
import kotlinx.coroutines.launch

class CheckoutActivity : AppCompatActivity() {

    private lateinit var rvCheckout: RecyclerView
    private lateinit var btnPurchase: Button
    private lateinit var btnCancel: Button
    private lateinit var viewModel: ShoppingListViewModel
    private val currentUser = FirebaseAuth.getInstance().currentUser
    val userId: String? get() = currentUser?.uid

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        menuInflater.inflate(R.menu.home_button_menu, menu)
        return true
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_checkout)

        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        rvCheckout = findViewById(R.id.rvCheckout)
        btnPurchase = findViewById(R.id.btnPurchase)
        btnCancel = findViewById(R.id.btnCancel)

        rvCheckout.layoutManager = LinearLayoutManager(this)
        viewModel = ViewModelProvider(this)[ShoppingListViewModel::class.java]

        // Observe the shopping list items
        viewModel.shoppingListItems.observe(this) { items ->
            rvCheckout.adapter = CheckoutAdapter(items)

            // Calculate total
            val grandTotal = items.sumOf { (product, quantity) ->
                val finalPrice = product.price * (1 - product.discount)
                finalPrice * quantity
            }

            // Update button text
            btnPurchase.text = getString(R.string.purchase_with_price, grandTotal)
        }

        btnPurchase.setOnClickListener {
            val items = viewModel.shoppingListItems.value
            if (items.isNullOrEmpty()) return@setOnClickListener

            // Calculate total amount
            val totalAmount = items.sumOf { (product, quantity) ->
                val finalPrice = product.price * (1 - product.discount)
                finalPrice * quantity
            }

            // Use lifecycleScope for coroutine
            lifecycleScope.launch {
                val success = ShoppingHistoryRepository().savePurchaseHistory(
                    userId = userId!!,
                    shoppingList = items,
                    totalAmount = totalAmount
                )
                if (success) {
                    viewModel.clearShoppingList()
                    Toast.makeText(
                        this@CheckoutActivity,
                        getString(R.string.purchase_successful),
                        Toast.LENGTH_SHORT
                    ).show()
                    val intent = Intent(this@CheckoutActivity, MainActivity::class.java)
                    intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK)
                    startActivity(intent)
                    finish() // Close checkout activity and navigate to main menu
                } else {
                    Toast.makeText(
                        this@CheckoutActivity,
                        getString(R.string.purchase_failed),
                        Toast.LENGTH_LONG
                    ).show()
                }
            }


        }

        btnCancel.setOnClickListener {
            finish() // Simply close the activity
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressedDispatcher.onBackPressed()
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            android.R.id.home -> {
                // Handles the back/home button in the action bar
                finish()
                true
            }
            R.id.action_go_to_main_menu -> {
                // Go to your MainActivity (or whatever your home is)
                startActivity(Intent(this, MainActivity::class.java))
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }
}
