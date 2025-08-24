package com.jason.supermarketapp.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.jason.supermarketapp.R
import com.jason.supermarketapp.data.entities.Product

class CheckoutAdapter(
    private val items: List<Pair<Product, Int>> // Pair of Product and quantity
) : RecyclerView.Adapter<CheckoutAdapter.CheckoutViewHolder>() {

    class CheckoutViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val productImage: ImageView = itemView.findViewById(R.id.productImage)
        val productName: TextView = itemView.findViewById(R.id.productName)
        val productQuantity: TextView = itemView.findViewById(R.id.productQuantity)
        val productTotalPrice: TextView = itemView.findViewById(R.id.productTotalPrice)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CheckoutViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_checkout, parent, false)
        return CheckoutViewHolder(view)
    }

    override fun onBindViewHolder(holder: CheckoutViewHolder, position: Int) {
        val (product, quantity) = items[position]

        holder.productName.text = product.getLocalizedName()
        holder.productQuantity.text = holder.itemView.context.getString(R.string.product_quantity_in_list, quantity)

        // Calculate total price including discount
        val finalPrice = product.price * (1 - product.discount)
        val totalPrice = finalPrice * quantity
        holder.productTotalPrice.text = holder.itemView.context.getString(R.string.product_price, totalPrice)

        if (product.imageUrl.isNotEmpty()) {
            Glide.with(holder.itemView.context)
                .load(product.imageUrl)
                .placeholder(R.drawable.placeholder_image)
                .into(holder.productImage)
        } else {
            holder.productImage.setImageResource(R.drawable.placeholder_image)
        }
    }

    override fun getItemCount() = items.size
}
