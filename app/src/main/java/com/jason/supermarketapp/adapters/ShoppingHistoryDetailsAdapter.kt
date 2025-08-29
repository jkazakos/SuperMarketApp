package com.jason.supermarketapp.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.jason.supermarketapp.R
import com.jason.supermarketapp.data.entities.ShoppingHistoryItem

class ShoppingHistoryDetailsAdapter(
    private var items: List<ShoppingHistoryItem>,
    private var imageMap: Map<String, String>
) : RecyclerView.Adapter<ShoppingHistoryDetailsAdapter.ProductViewHolder>() {

    inner class ProductViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val productName: TextView = itemView.findViewById(R.id.productName)
        val priceText: TextView = itemView.findViewById(R.id.priceText)
        val quantityText: TextView = itemView.findViewById(R.id.quantityText)
        val productImage: ImageView = itemView.findViewById(R.id.productImage)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ProductViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_shopping_history_details, parent, false)
        return ProductViewHolder(view)
    }

    override fun onBindViewHolder(holder: ProductViewHolder, position: Int) {
        val item = items[position]
        val itemQuantity = item.quantity

        holder.productName.text = item.getLocalizedName()
        holder.quantityText.text = holder.itemView.context.getString(R.string.product_quantity_in_list, itemQuantity)

        holder.priceText.text = holder.itemView.context.getString(R.string.product_price, item.priceAtPurchase * itemQuantity)

        val imageUrl = imageMap[item.productId]
        if (!imageUrl.isNullOrEmpty()) {
            Glide.with(holder.itemView.context)
                .load(imageUrl)
                .placeholder(R.drawable.placeholder_image)
                .centerCrop()
                .into(holder.productImage)
        } else {
            holder.productImage.setImageResource(R.drawable.placeholder_image)
        }
    }

    override fun getItemCount(): Int = items.size

    // Updates the adapter's data with a new list and calculates the differences to optimize UI updates.
    fun updateData(newList: List<ShoppingHistoryItem>) {
        val diffCallback = object : androidx.recyclerview.widget.DiffUtil.Callback() {
            override fun getOldListSize() = items.size
            override fun getNewListSize() = newList.size

            override fun areItemsTheSame(oldItemPosition: Int, newItemPosition: Int) =
                items[oldItemPosition].productId == newList[newItemPosition].productId

            override fun areContentsTheSame(oldItemPosition: Int, newItemPosition: Int) =
                items[oldItemPosition] == newList[newItemPosition]
        }

        val diffResult = androidx.recyclerview.widget.DiffUtil.calculateDiff(diffCallback)

        items = newList
        diffResult.dispatchUpdatesTo(this)
    }

    // Updates the image map and refreshes only the items that have an image in the new map.
    fun updateImageMap(newMap: Map<String, String>) {
        imageMap = newMap
        // Update only visible items that have an image
        items.forEachIndexed { index, item ->
            if (newMap.containsKey(item.productId)) {
                notifyItemChanged(index)
            }
        }
    }

}
