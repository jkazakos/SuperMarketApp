package com.jason.supermarketapp.ui.activities

import android.os.Bundle
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
import kotlin.math.round

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
        val descriptionText: TextView = findViewById(R.id.detailDescription)
        val quantityText: TextView = findViewById(R.id.detailQuantity)
        val productImage: ImageView = findViewById(R.id.detailImage)
        val wishlistBtn: Button = findViewById(R.id.wishListBtn)
        val shoppingListBtn: Button = findViewById(R.id.shoppingListBtn)

        nameText.text = getString(product.nameResId)

        val priceToShow = if (product.onSale && product.discount > 0 && product.discount <= 100) {
            val discounted = product.price * (1 - product.discount / 100)
            round(discounted * 100) / 100 // round to 2 decimal places
        } else {
            product.price
        }
        priceText.text = getString(R.string.product_price, priceToShow)

        quantityText.text = getString(R.string.product_quantity, product.quantityAvailable)

        descriptionText.text = if (product.descriptionResId != 0)
            getString(product.descriptionResId)
        else
            getString(R.string.no_description)

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

        // Observe wishlist status to update the button text
        lifecycleScope.launch {
            viewModel.isInWishlist.collectLatest { isInWishlist ->
                wishlistBtn.text = if (isInWishlist)
                    getString(R.string.remove_from_wishlist)
                else
                    getString(R.string.add_to_wishlist)
            }
        }

        wishlistBtn.setOnClickListener {
            val isInWishlist = viewModel.isInWishlist.value
            // Observe wishlist status to update the button text
            if (isInWishlist) {
                viewModel.removeFromWishlist(product.id)
                    Toast.makeText(this@ProductDetailsActivity, getString(R.string.removed_from_wishlist), Toast.LENGTH_SHORT).show()
                } else {
                    viewModel.addToWishlist(product.id)
                    Toast.makeText(this@ProductDetailsActivity, getString(R.string.added_to_wishlist), Toast.LENGTH_SHORT).show()
                }

    }

        shoppingListBtn.setOnClickListener {
            // TODO: handle adding to shopping list
        }
}
    override fun onSupportNavigateUp(): Boolean {
        onBackPressedDispatcher.onBackPressed()
        return true
    }
}
