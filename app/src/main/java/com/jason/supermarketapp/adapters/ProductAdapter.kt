package com.jason.supermarketapp.adapters

import android.text.SpannableString
import android.text.Spanned
import android.text.style.StrikethroughSpan
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import android.widget.ImageView
import android.widget.ViewSwitcher
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.jason.supermarketapp.R
import com.jason.supermarketapp.data.entities.Product

class ProductAdapter(
    private val onItemClick: (Product) -> Unit,
    ) :
    ListAdapter<Product, ProductAdapter.ProductViewHolder>(ProductDiffCallback()) {

        class ProductViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            val name: TextView = view.findViewById(R.id.productName)
            val image: ImageView = view.findViewById(R.id.productImage)
            val priceSwitcher: ViewSwitcher = view.findViewById(R.id.priceSwitcher)
            val normalPrice: TextView = view.findViewById(R.id.normalPrice)
            val oldPrice: TextView = view.findViewById(R.id.oldPrice)
            val newPrice: TextView = view.findViewById(R.id.newPrice)

        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ProductViewHolder {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_product, parent, false)
            return ProductViewHolder(view)
        }

        override fun onBindViewHolder(holder: ProductViewHolder, position: Int) {
            val product = getItem(position)
            holder.name.text = holder.itemView.context.getString(product.nameResId)

            val hasDiscount = product.discount > 0.0

            if (hasDiscount) {
                // 1. Switch the ViewSwitcher to the discount layout (index 1)
                holder.priceSwitcher.displayedChild = 1

                // 2. Set the original price with a strikethrough effect
                val oldPriceText = holder.itemView.context.getString(R.string.product_price, product.price)
                val spannableString = SpannableString(oldPriceText)
                spannableString.setSpan(StrikethroughSpan(), 0, oldPriceText.length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
                holder.oldPrice.text = spannableString

                // 3. Calculate and set the new discounted price
                val newPriceValue = product.price * (1 - product.discount)
                holder.newPrice.text = holder.itemView.context.getString(R.string.product_price, newPriceValue)

            } else {
                // 1. Switch the ViewSwitcher to the normal price layout (index 0)
                holder.priceSwitcher.displayedChild = 0

                // 2. Set the regular price
                holder.normalPrice.text = holder.itemView.context.getString(R.string.product_price, product.price)
            }

            if (product.imageUrl.isNotEmpty()) {
                // Load image from URL using Glide
                Glide.with(holder.itemView.context)
                    .load(product.imageUrl)
                    .placeholder(R.drawable.placeholder_image) // Placeholder image while loading
                    .into(holder.image)
            } else {
                // If no image URL, use the local resource or a default placeholder
                holder.image.setImageResource(
                    if (product.imageResId != 0) product.imageResId else R.drawable.placeholder_image
                )
            }

            // Click on the whole row → open ProductDetailsActivity
            holder.itemView.setOnClickListener {
                onItemClick(product)
            }
        }
    }

class ProductDiffCallback : DiffUtil.ItemCallback<Product>() {
    override fun areItemsTheSame(oldItem: Product, newItem: Product): Boolean {
        // Here you should compare a unique identifier for your products
        return oldItem.id == newItem.id
    }

    override fun areContentsTheSame(oldItem: Product, newItem: Product): Boolean {
        // Compare the contents of the products to detect changes
        return oldItem == newItem
    }
}







