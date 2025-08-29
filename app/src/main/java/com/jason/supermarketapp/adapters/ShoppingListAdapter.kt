package com.jason.supermarketapp.adapters

import android.text.SpannableString
import android.text.Spanned
import android.text.style.StrikethroughSpan
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import android.widget.ViewSwitcher
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.jason.supermarketapp.R
import com.jason.supermarketapp.data.entities.Product


class ShoppingListAdapter(
    private val items: MutableList<Pair<Product, Int>>,
    private val onItemClick: (Product) -> Unit,
    private val onIncreaseClick: (Product, Int) -> Unit,
    private val onDecreaseClick: (Product, Int) -> Unit,
) : RecyclerView.Adapter<ShoppingListAdapter.ShoppingListViewHolder>() {

    class ShoppingListViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val productName: TextView = itemView.findViewById(R.id.productName)
        val productImage: ImageView = itemView.findViewById(R.id.productImage)
        val priceSwitcher: ViewSwitcher = itemView.findViewById(R.id.priceSwitcher)
        val normalPrice: TextView = itemView.findViewById(R.id.normalPrice)
        val oldPrice: TextView = itemView.findViewById(R.id.oldPrice)
        val newPrice: TextView = itemView.findViewById(R.id.newPrice)
        val increaseButton: ImageButton = itemView.findViewById(R.id.increaseButton)
        val decreaseButton: ImageButton = itemView.findViewById(R.id.decreaseButton)
        val quantityText: TextView = itemView.findViewById(R.id.quantityText)

    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ShoppingListViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_shopping_list, parent, false)
        return ShoppingListViewHolder(view)

    }

    override fun onBindViewHolder(holder: ShoppingListViewHolder, position: Int) {
        val (product, quantity) = items[position] // destructure Pair<Product, Int>

        holder.productName.text = product.getLocalizedName()
        holder.quantityText.text = quantity.toString()

        val hasDiscount = product.discount > 0.0
        if (hasDiscount) {
            holder.priceSwitcher.displayedChild = 1
            val oldPriceText = holder.itemView.context.getString(R.string.product_price, product.price)
            val spannableString = SpannableString(oldPriceText)
            spannableString.setSpan(StrikethroughSpan(), 0, oldPriceText.length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
            holder.oldPrice.text = spannableString
            val newPriceValue = product.price * (1 - product.discount)
            holder.newPrice.text = holder.itemView.context.getString(R.string.product_price, newPriceValue)
        } else {
            holder.priceSwitcher.displayedChild = 0
            holder.normalPrice.text = holder.itemView.context.getString(R.string.product_price, product.price)
        }

        // Load image with Glide
        if (product.imageUrl.isNotEmpty()) {
            Glide.with(holder.itemView.context)
                .load(product.imageUrl)
                .placeholder(R.drawable.placeholder_image)
                .into(holder.productImage)
        } else {
            holder.productImage.setImageResource(R.drawable.placeholder_image)
        }

        // Update minus/delete icon
        fun updateMinusIcon(qty: Int) {
            if (qty <= 1) {
                holder.decreaseButton.setImageResource(R.drawable.ic_delete_icon)
            } else {
                holder.decreaseButton.setImageResource(R.drawable.ic_remove_icon)
            }
        }

        updateMinusIcon(quantity)

        // Item click
        holder.itemView.setOnClickListener { onItemClick(product) }

        // Plus button
        holder.increaseButton.setOnClickListener {
            val pos = holder.bindingAdapterPosition
            if (pos == RecyclerView.NO_POSITION) return@setOnClickListener
            val newQuantity = items[pos].second + 1
            items[pos] = items[pos].first to newQuantity
            holder.quantityText.text = newQuantity.toString()
            updateMinusIcon(newQuantity)
            onIncreaseClick(items[pos].first, newQuantity)
        }

        // Minus / delete button
        holder.decreaseButton.setOnClickListener {
            val pos = holder.bindingAdapterPosition
            if (pos == RecyclerView.NO_POSITION) return@setOnClickListener
            val currentQuantity = items[pos].second
            if (currentQuantity > 1) {
                val newQuantity = currentQuantity - 1
                items[pos] = items[pos].first to newQuantity
                holder.quantityText.text = newQuantity.toString()
                updateMinusIcon(newQuantity)
                onDecreaseClick(items[pos].first, newQuantity)
            } else {
                // Delete the item
                val removedProduct = items[pos].first
                items.removeAt(pos)
                notifyItemRemoved(pos)
                onDecreaseClick(removedProduct, 0)
            }
        }

    }

    override fun getItemCount() = items.size

    fun updateData(newItems: List<Pair<Product, Int>>) {
        items.clear()
        items.addAll(newItems)
        notifyDataSetChanged()
    }

}
