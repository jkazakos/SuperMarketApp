package com.jason.supermarketapp.adapters

import android.text.SpannableString
import android.text.Spanned
import android.text.style.StrikethroughSpan
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import android.widget.ViewSwitcher
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.jason.supermarketapp.R
import com.jason.supermarketapp.data.entities.Product


class WishlistAdapter(
    private val products: MutableList<Product>,
    private val onItemClick: (Product) -> Unit,
    private val onRemoveClick: (Product) -> Unit
) : RecyclerView.Adapter<WishlistAdapter.WishlistViewHolder>() {

    class WishlistViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val productName: TextView = itemView.findViewById(R.id.productName)
        val productImage: ImageView = itemView.findViewById(R.id.productImage)
        val removeButton: Button = itemView.findViewById(R.id.removeButton)
        val priceSwitcher: ViewSwitcher = itemView.findViewById(R.id.priceSwitcher)
        val normalPrice: TextView = itemView.findViewById(R.id.normalPrice)
        val oldPrice: TextView = itemView.findViewById(R.id.oldPrice)
        val newPrice: TextView = itemView.findViewById(R.id.newPrice)

    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): WishlistViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_wishlist, parent, false)
        return WishlistViewHolder(view)
    }

    override fun onBindViewHolder(holder: WishlistViewHolder, position: Int) {
        val product = products[position]
        holder.productName.text = product.getLocalizedName()

        val hasDiscount = product.discount > 0.0

        if (hasDiscount) {
            // Switch to the discount layout
            holder.priceSwitcher.displayedChild = 1

            // Set the old price with a strikethrough
            val oldPriceText = holder.itemView.context.getString(R.string.product_price, product.price)
            val spannableString = SpannableString(oldPriceText)
            spannableString.setSpan(StrikethroughSpan(), 0, oldPriceText.length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
            holder.oldPrice.text = spannableString

            // Calculate and set the new discounted price
            val newPriceValue = product.price * (1 - product.discount)
            holder.newPrice.text = holder.itemView.context.getString(R.string.product_price, newPriceValue)

        } else {
            // Switch to the normal price TextView
            holder.priceSwitcher.displayedChild = 0
            holder.normalPrice.text = holder.itemView.context.getString(R.string.product_price, product.price)
        }

        // Load images with Glide
        if (product.imageUrl.isNotEmpty()) {
            Glide.with(holder.itemView.context)
                .load(product.imageUrl)
                .placeholder(R.drawable.placeholder_image)
                .into(holder.productImage)
        } else {
            holder.productImage.setImageResource(R.drawable.placeholder_image)
        }

        holder.itemView.setOnClickListener {
            onItemClick(product)
        }

        holder.removeButton.setOnClickListener {
            onRemoveClick(product)
        }
    }

    override fun getItemCount() = products.size

    fun updateData(newProducts: List<Product>) {
        products.clear()
        products.addAll(newProducts)
        notifyDataSetChanged()
    }

}
