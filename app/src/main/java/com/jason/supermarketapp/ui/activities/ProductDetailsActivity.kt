package com.jason.supermarketapp.ui.activities

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

class ProductDetailsActivity : AppCompatActivity() {

    private val viewModel: ProductDetailsViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_product_details)

        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        @Suppress("DEPRECATION")
        val product = intent.getParcelableExtra<Product>("product") ?: return

        supportActionBar?.title = getString(product.nameResId)

        val nameText: TextView = findViewById(R.id.detailName)
        val priceText: TextView = findViewById(R.id.detailPrice)
        val priceTextOnSale: TextView = findViewById(R.id.detailPriceOnSale)
        val descriptionText: TextView = findViewById(R.id.detailDescription)
        val quantityText: TextView = findViewById(R.id.detailQuantity)
        val productImage: ImageView = findViewById(R.id.detailImage)
        val wishlistBtn: Button = findViewById(R.id.wishListBtn)
        val shoppingListBtn: Button = findViewById(R.id.shoppingListBtn)

        nameText.text = getString(product.nameResId)

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

        descriptionText.text = if (product.descriptionResId != 0) getString(product.descriptionResId) else getString(R.string.no_description)

        if (product.imageUrl.isNotEmpty()) {
            Glide.with(this)
                .load(product.imageUrl)
                .placeholder(R.drawable.placeholder_image) // Placeholder image while loading
                .into(productImage)
        } else {
            // If no image URL, use the local resource or a default placeholder
            productImage.setImageResource(
                if (product.imageResId != 0) product.imageResId else R.drawable.placeholder_image
            )
        }

        viewModel.checkWishlistStatus(product.id)

        wishlistBtn.setOnClickListener {
            viewModel.toggleWishlistStatus(product.id)
    }

        shoppingListBtn.setOnClickListener {
            // TODO: handle adding to shopping list
        }

        // Observe wishlist status to update the button text
        lifecycleScope.launch {
            viewModel.isInWishlist.collectLatest { isInWishlist ->
                wishlistBtn.text = if (isInWishlist)
                    getString(R.string.remove_from_wishlist)
                else
                    getString(R.string.add_to_wishlist)
            }
        }

        // Observe the one-time events for Toast messages
        lifecycleScope.launch {
            viewModel.uiMessage.collectLatest { messageResId ->
                Toast.makeText(this@ProductDetailsActivity, getString(messageResId), Toast.LENGTH_SHORT).show()
            }
        }
}
    override fun onSupportNavigateUp(): Boolean {
        onBackPressedDispatcher.onBackPressed()
        return true
    }
}
