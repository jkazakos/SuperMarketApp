package com.jason.supermarketapp.adapters

import android.annotation.SuppressLint
import android.content.Intent
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import android.widget.ImageView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.jason.supermarketapp.ui.activities.ProductDetailsActivity
import com.jason.supermarketapp.R
import com.jason.supermarketapp.data.entities.Product

class ProductAdapter(
    private val products: MutableList<Product>,
    private val onItemClick: (Product) -> Unit,
    ) :
    RecyclerView.Adapter<ProductAdapter.ProductViewHolder>() {

        class ProductViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            val name: TextView = view.findViewById(R.id.productName)
            val price: TextView = view.findViewById(R.id.productPrice)
            val image: ImageView = view.findViewById(R.id.productImage)

        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ProductViewHolder {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_product, parent, false)
            return ProductViewHolder(view)
        }

        override fun onBindViewHolder(holder: ProductViewHolder, position: Int) {
            val product = products[position]
            holder.name.text = holder.itemView.context.getString(product.nameResId)
            holder.price.text = holder.itemView.context.getString(R.string.product_price, product.price)

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
                val context = holder.itemView.context
                val intent = Intent(context, ProductDetailsActivity::class.java)
                intent.putExtra("product", product)
                context.startActivity(intent)
            }
        }

        override fun getItemCount(): Int = products.size

        @SuppressLint("NotifyDataSetChanged")
        fun updateData(newProducts: List<Product>) {
            products.clear()
            products.addAll(newProducts)
            notifyDataSetChanged()
        }
    }







