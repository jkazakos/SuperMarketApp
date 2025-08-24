package com.jason.supermarketapp.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.jason.supermarketapp.R
import com.jason.supermarketapp.data.entities.ShoppingHistory
import java.text.SimpleDateFormat
import java.util.Locale

class ShoppingHistoryAdapter(
    private var historyList: List<ShoppingHistory>,
    private val onItemClick: (ShoppingHistory) -> Unit
) : RecyclerView.Adapter<ShoppingHistoryAdapter.HistoryViewHolder>() {

    inner class HistoryViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val tvDate: TextView = itemView.findViewById(R.id.tvDate)
        val tvTotalPrice: TextView = itemView.findViewById(R.id.tvTotalPrice)
        val tvItemCount: TextView = itemView.findViewById(R.id.tvItemCount)
        val tvItemPreview: TextView = itemView.findViewById(R.id.tvItemPreview)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): HistoryViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_shopping_history, parent, false)
        return HistoryViewHolder(view)
    }

    override fun onBindViewHolder(holder: HistoryViewHolder, position: Int) {
        val history = historyList[position]

        val totalPrice = history.totalAmount
        val itemCount = history.items.size

        val formattedDate = history.datePurchased?.toDate()?.let {
            val sdf = SimpleDateFormat("dd MMM yyyy", Locale.getDefault())
            sdf.format(it)
        } ?: holder.itemView.context.getString(R.string.unknown_date)

        // Build preview string: first 2 items, then "+N more" if needed
        val resources = holder.itemView.context.resources
        val itemNames = history.items.map { it.getLocalizedName() }

        val preview = if (itemNames.size > 2) {
            val firstTwo = itemNames.take(2).joinToString(", ")
            val moreText = resources.getString(R.string.preview_more, itemNames.size - 2)
            resources.getString(R.string.preview_items_with_more, firstTwo, moreText)
        } else {
            resources.getString(R.string.preview_items, itemNames.joinToString(", "))
        }


        holder.tvDate.text = formattedDate
        holder.tvTotalPrice.text = holder.itemView.context.getString(R.string.total_price, totalPrice)
        holder.tvItemCount.text = holder.itemView.context.getString(R.string.item_count, itemCount)
        holder.tvItemPreview.text = preview

        // Handle click
        holder.itemView.setOnClickListener {
            onItemClick(history)
        }
    }

    override fun getItemCount(): Int = historyList.size

    fun updateData(newList: List<ShoppingHistory>) {
        historyList = newList
        notifyDataSetChanged()
    }
}
