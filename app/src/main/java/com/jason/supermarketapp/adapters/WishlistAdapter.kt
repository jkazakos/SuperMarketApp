package com.jason.supermarketapp.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
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
        val productPrice: TextView = itemView.findViewById(R.id.productPrice)
        val productImage: ImageView = itemView.findViewById(R.id.productImage)
        val removeButton: Button = itemView.findViewById(R.id.removeButton)

    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): WishlistViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_wishlist, parent, false)
        return WishlistViewHolder(view)
    }

    override fun onBindViewHolder(holder: WishlistViewHolder, position: Int) {
        val product = products[position]
        holder.productName.text = holder.itemView.context.getString(product.nameResId)
        holder.productPrice.text = holder.itemView.context.getString(R.string.product_price, product.price)
        // Load images from URL using Glide, with a fallback to local resources
        if (product.imageUrl.isNotEmpty()) {
            Glide.with(holder.itemView.context)
                .load(product.imageUrl)
                .placeholder(product.imageResId)
                .into(holder.productImage)
        } else {
            holder.productImage.setImageResource(
                if (product.imageResId != 0) product.imageResId else R.drawable.placeholder_image
            )
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
