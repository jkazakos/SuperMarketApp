package com.jason.supermarketapp.ui.activities

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.bumptech.glide.Glide
import com.jason.supermarketapp.R
import com.jason.supermarketapp.data.entities.Product
import com.jason.supermarketapp.ui.viewmodels.ProductDetailsViewModel
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import android.graphics.Paint
import android.text.InputType
import android.view.Menu
import android.view.MenuItem
import android.widget.EditText
import androidx.appcompat.app.AlertDialog
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.repeatOnLifecycle
import com.google.firebase.auth.FirebaseAuth
import com.jason.supermarketapp.MainActivity

class ProductDetailsActivity : AppCompatActivity() {

    val currentUser = FirebaseAuth.getInstance().currentUser
    private val userId: String? get() = currentUser?.uid

    private val viewModel: ProductDetailsViewModel by viewModels()

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        menuInflater.inflate(R.menu.home_button_menu, menu)
        return true
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_product_details)

        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        val product = intent.getParcelableExtra("product", Product::class.java)

        if (product == null) {
            Toast.makeText(this, getString(R.string.error_loading_product), Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        supportActionBar?.title = product.getLocalizedName()

        val nameText: TextView = findViewById(R.id.detailName)
        val priceText: TextView = findViewById(R.id.detailPrice)
        val priceTextOnSale: TextView = findViewById(R.id.detailPriceOnSale)
        val descriptionText: TextView = findViewById(R.id.detailDescription)
        val quantityText: TextView = findViewById(R.id.detailQuantity)
        val productImage: ImageView = findViewById(R.id.detailImage)
        val wishlistBtn: Button = findViewById(R.id.wishListBtn)
        val shoppingListBtn: Button = findViewById(R.id.shoppingListBtn)

        nameText.text = product.getLocalizedName()

        descriptionText.text = if (product.description.isNotEmpty()) product.getLocalizedDescription()
        else getString(R.string.no_description)

        if (product.onSale) {
            // Show the regular price with a strikethrough effect
            priceText.text = getString(R.string.product_price, product.price)
            priceText.paintFlags = priceText.paintFlags or Paint.STRIKE_THRU_TEXT_FLAG
            priceText.visibility = View.VISIBLE

            // Calculate and show the discounted price
            val discountedPrice = product.price * (1 - product.discount)
            priceTextOnSale.text = getString(R.string.product_price_on_sale, discountedPrice)
            priceTextOnSale.visibility = View.VISIBLE
        } else {
            // Not on sale, show only the regular price
            priceText.text = getString(R.string.product_price, product.price)
            priceText.visibility = View.VISIBLE
            priceTextOnSale.visibility = View.GONE
        }

        quantityText.text =  if (product.quantityAvailable !=0 ) getString(R.string.product_quantity, product.quantityAvailable) else getString(R.string.sold_out)

        if (product.imageUrl.isNotEmpty()) {
            Glide.with(this)
                .load(product.imageUrl)
                .placeholder(R.drawable.placeholder_image) // Placeholder image while loading
                .centerCrop()
                .into(productImage)
        } else {
            // If no image URL, use the local resource or a default placeholder
            productImage.setImageResource(R.drawable.placeholder_image)
        }

        // ---- Wishlist Button ----
        if (userId == null) {
            // Not logged in
            wishlistBtn.setOnClickListener {
                Toast.makeText(this, getString(R.string.sign_in_required), Toast.LENGTH_SHORT).show()
                // Optional: navigate to SignInActivity
            }
        } else {
            // Logged in: normal wishlist behavior
            viewModel.checkWishlistStatus(userId!!, product.id)

            wishlistBtn.setOnClickListener {
                lifecycleScope.launch {
                    viewModel.toggleWishlistStatus(userId!!, product.id)
                }
            }

            lifecycleScope.launch {
                viewModel.isInWishlist.collectLatest { isInWishlist ->
                    wishlistBtn.text = if (isInWishlist)
                        getString(R.string.remove_from_wishlist)
                    else
                        getString(R.string.add_to_wishlist)
                }
            }
        }

        // ---- Shopping List Button ----
        if (userId == null) {
            // Not logged in
            shoppingListBtn.setOnClickListener {
                Toast.makeText(this, getString(R.string.sign_in_required), Toast.LENGTH_SHORT).show()
                // Optional: navigate to SignInActivity
            }
        } else {
            shoppingListBtn.setOnClickListener {
                lifecycleScope.launch {
                    viewModel.toggleShoppingListStatus(product.id)
                }
            }
        }

        // Observe the one-time events for Toast messages
        lifecycleScope.launch {
            viewModel.uiMessage.collectLatest { messageResId ->
                Toast.makeText(this@ProductDetailsActivity, getString(messageResId), Toast.LENGTH_SHORT).show()
            }
        }

        // Observe when the ViewModel wants to show the quantity dialog
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.showAddQuantityDialog.collectLatest { productId ->
                    showQuantityDialog(product)
                }
            }
        }

    }

    /** Shows a dialog to input quantity when adding a product to the shopping list.
     * Validates the input against available stock and shows appropriate messages.
     */
    private fun showQuantityDialog(product: Product) {
        val input = EditText(this).apply {
            inputType = InputType.TYPE_CLASS_NUMBER
            hint = getString(R.string.enter_quantity_hint)
        }

        AlertDialog.Builder(this)
            .setTitle(getString(R.string.add_to_shopping_list))
            .setView(input)
            .setPositiveButton(getString(R.string.add)) { _, _ ->
                val quantity = input.text.toString().toIntOrNull() ?: 0
                when {
                    // Case 1: Out of stock
                    product.quantityAvailable <= 0 -> {
                        Toast.makeText(
                            this,
                            getString(R.string.out_of_stock),
                            Toast.LENGTH_SHORT
                        ).show()
                    }

                    // Case 2: Exceeds stock
                    quantity > product.quantityAvailable -> {
                        Toast.makeText(
                            this,
                            getString(R.string.product_availability, product.quantityAvailable),
                            Toast.LENGTH_SHORT
                        ).show()
                    }

                    // Case 3: Valid quantity
                    else -> {
                        viewModel.addProductToShoppingList(
                            userId ?: return@setPositiveButton,
                            product.id,
                            quantity
                        )
                    }
                }
            }
            .setNegativeButton(getString(R.string.cancel_text), null)
            .show()
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
