package com.jason.supermarketapp.ui.activities

import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.firebase.auth.FirebaseAuth
import com.jason.supermarketapp.MainActivity
import com.jason.supermarketapp.R
import com.jason.supermarketapp.adapters.ShoppingHistoryDetailsAdapter
import com.jason.supermarketapp.data.entities.Product
import com.jason.supermarketapp.data.entities.ShoppingHistoryItem
import com.jason.supermarketapp.data.repositories.ShoppingHistoryRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext


class ShoppingHistoryDetailsActivity: AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: ShoppingHistoryDetailsAdapter
    private lateinit var btnReorder: Button
    private var imageMap: Map<String, String> = emptyMap()
    private var shoppingItems: List<ShoppingHistoryItem> = emptyList()
    private val repository = ShoppingHistoryRepository()
    private val currentUser = FirebaseAuth.getInstance().currentUser
    private val userId: String? get() = currentUser?.uid

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        menuInflater.inflate(R.menu.home_button_menu, menu)
        return true
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_shopping_history_details)

        supportActionBar?.title = getString(R.string.shopping_history)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        recyclerView = findViewById(R.id.rvShoppingHistoryProducts)
        recyclerView.layoutManager = LinearLayoutManager(this)

        adapter = ShoppingHistoryDetailsAdapter(shoppingItems, imageMap)
        recyclerView.adapter = adapter

        btnReorder = findViewById(R.id.btnReorder)
        btnReorder.setOnClickListener {
            reorderItems()
        }

        val historyId = intent.getStringExtra("historyId") ?: run {
            finish() // no id passed, close activity
            return
        }

        fetchShoppingHistory(historyId)

    }

    private fun fetchShoppingHistory(historyId: String) {
        val userId = userId ?: run {
            finish()
            return
        }

        lifecycleScope.launch(Dispatchers.IO) {
            val history = repository.getShoppingHistoryById(userId, historyId)
            if (history != null) {
                shoppingItems = history.items
                val images = repository.getProductImagesMap(shoppingItems.map { it.productId })

                withContext(Dispatchers.Main) {
                    imageMap = images
                    adapter.updateData(shoppingItems)
                    adapter.updateImageMap(imageMap)
                    updateReorderButton()
                }
            }
        }
    }


    private fun updateReorderButton() {
        val hasItems = shoppingItems.isNotEmpty()
        btnReorder.visibility = if (hasItems) View.VISIBLE else View.GONE

        if (hasItems) {
            val totalPrice = shoppingItems.sumOf { it.priceAtPurchase * it.quantity }
            btnReorder.text = getString(R.string.buy_again_with_price, totalPrice)
        }
    }

    private fun reorderItems() {
        val uid = userId ?: return

        lifecycleScope.launch(Dispatchers.IO) {
            // Temporarily convert ShoppingHistoryItem -> Pair<Product, Int> to pass it through the method
            val shoppingList: List<Pair<Product, Int>> = shoppingItems.map { item ->
                val product = Product(
                    id = item.productId,
                    name = item.productName,
                    description = emptyMap(),
                    category = emptyMap(),
                    price = item.priceAtPurchase,
                    onSale = false,
                    discount = 0.0,
                    quantityAvailable = 0,
                    imageUrl = imageMap[item.productId] ?: ""
                )
                product to item.quantity
            }

            val totalAmount = shoppingItems.sumOf { it.priceAtPurchase * it.quantity }

            // 1. Try to decrement stock for each item
            var stockOk = true
            var failedProduct: Product? = null

            for ((product, quantity) in shoppingList) {
                val success = repository.decreaseProductQuantity(product.id, quantity)
                if (!success) {
                    stockOk = false
                    failedProduct = product
                    break
                }
            }

            withContext(Dispatchers.Main) {
                if (!stockOk) {
                    val message = failedProduct?.getLocalizedName()?.let {
                        getString(R.string.out_of_stock_item, it)
                    } ?: getString(R.string.out_of_stock)

                    Toast.makeText(this@ShoppingHistoryDetailsActivity, message, Toast.LENGTH_LONG).show()
                    return@withContext
                }

                val success = repository.savePurchaseHistory(uid, shoppingList, totalAmount)

                if (success) {
                    Toast.makeText(
                        this@ShoppingHistoryDetailsActivity,
                        getString(R.string.purchase_successful),
                        Toast.LENGTH_SHORT
                    ).show()
                    startActivity(Intent(this@ShoppingHistoryDetailsActivity, MainActivity::class.java))
                } else {
                    Toast.makeText(
                        this@ShoppingHistoryDetailsActivity,
                        getString(R.string.purchase_failed),
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
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
                // Go to MainActivity
                startActivity(Intent(this, MainActivity::class.java))
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }
}
